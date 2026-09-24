import { NextRequest, NextResponse } from "next/server"
import { fail, validationFail } from "@/lib/auth/flows"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { cambiarPasswordSchema } from "@/lib/auth/schemas"
import { getCurrentUser, startSession } from "@/lib/auth/session"
import { updateUser } from "@/lib/auth/store"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return fail("No has iniciado sesion", 401)

    const parsed = cambiarPasswordSchema.safeParse(await request.json())
    if (!parsed.success) return validationFail(parsed.error)

    if (!(await verifyPassword(parsed.data.actual, user.passwordHash))) {
      return fail("La contrasena actual es incorrecta", 403)
    }

    // Nueva version de sesion: cierra la sesion en otros dispositivos y renueva la actual
    const updated = await updateUser(user.id, {
      passwordHash: await hashPassword(parsed.data.nueva),
      sessionVersion: user.sessionVersion + 1,
    })
    await startSession(updated!, true)

    return NextResponse.json({ success: true, message: "Contrasena actualizada" })
  } catch (error) {
    console.error("Cambiar contrasena error:", error)
    return fail("Error interno del servidor", 500)
  }
}
