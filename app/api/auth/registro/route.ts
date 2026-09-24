import { NextRequest, NextResponse } from "next/server"
import { fail, validationFail } from "@/lib/auth/flows"
import { hashPassword } from "@/lib/auth/password"
import { rateLimit } from "@/lib/auth/rate-limit"
import { registroSchema } from "@/lib/auth/schemas"
import { homeForRole, startSession } from "@/lib/auth/session"
import { createUser, toPublic } from "@/lib/auth/store"

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
    if (!rateLimit(`registro:${ip}`, 5, 60 * 60_000)) {
      return fail("Demasiados registros desde esta conexion. Intenta mas tarde.", 429)
    }

    const parsed = registroSchema.safeParse(await request.json())
    if (!parsed.success) return validationFail(parsed.error)
    const { password, ...datos } = parsed.data

    const user = await createUser({ ...datos, passwordHash: await hashPassword(password) })
    if (!user) {
      return fail("Ya existe una cuenta con este correo. Inicia sesion o recupera tu contrasena.", 409)
    }

    await startSession(user, true)

    return NextResponse.json({
      success: true,
      data: {
        user: toPublic(user),
        redirectTo: homeForRole(user.rol),
      },
    })
  } catch (error) {
    console.error("Registro error:", error)
    return fail("Error interno del servidor", 500)
  }
}
