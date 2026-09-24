import { NextRequest, NextResponse } from "next/server"
import { fail, validationFail } from "@/lib/auth/flows"
import { hashPassword } from "@/lib/auth/password"
import { restablecerSchema } from "@/lib/auth/schemas"
import { consumeToken, findUserById, updateUser } from "@/lib/auth/store"

export async function POST(request: NextRequest) {
  try {
    const parsed = restablecerSchema.safeParse(await request.json())
    if (!parsed.success) return validationFail(parsed.error)

    const userId = await consumeToken(parsed.data.token, "restablecer_password")
    const user = userId ? await findUserById(userId) : null
    if (!user) {
      return fail("El enlace no es valido o ya expiro. Solicita uno nuevo.", 400)
    }

    await updateUser(user.id, {
      passwordHash: await hashPassword(parsed.data.password),
      sessionVersion: user.sessionVersion + 1, // cierra todas las sesiones abiertas
      emailVerificado: true, // abrir el enlace demuestra que el correo es suyo
    })

    return NextResponse.json({ success: true, message: "Contrasena actualizada. Ya puedes iniciar sesion." })
  } catch (error) {
    console.error("Restablecer error:", error)
    return fail("Error interno del servidor", 500)
  }
}
