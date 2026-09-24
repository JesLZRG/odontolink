import { NextRequest, NextResponse } from "next/server"
import { fail, validationFail } from "@/lib/auth/flows"
import { verifyPassword } from "@/lib/auth/password"
import { perfilSchema } from "@/lib/auth/schemas"
import { endSession, getCurrentUser } from "@/lib/auth/session"
import { deleteUser, toPublic, updateUser } from "@/lib/auth/store"

// Cuenta del usuario autenticado
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return fail("No has iniciado sesion", 401)
  return NextResponse.json({ success: true, data: toPublic(user) })
}

// Actualizar perfil
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return fail("No has iniciado sesion", 401)

    const parsed = perfilSchema.safeParse(await request.json())
    if (!parsed.success) return validationFail(parsed.error)
    const { nombre, telefono, ciudad } = parsed.data

    const updated = await updateUser(user.id, {
      nombre,
      telefono: telefono || undefined,
      ciudad: ciudad || undefined,
    })
    return NextResponse.json({ success: true, data: toPublic(updated!), message: "Perfil actualizado" })
  } catch (error) {
    console.error("Actualizar perfil error:", error)
    return fail("Error interno del servidor", 500)
  }
}

// Eliminar cuenta (requiere confirmar la contrasena)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return fail("No has iniciado sesion", 401)

    const { password } = await request.json()
    if (typeof password !== "string" || !(await verifyPassword(password, user.passwordHash))) {
      return fail("Contrasena incorrecta", 403)
    }

    await deleteUser(user.id)
    await endSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Eliminar cuenta error:", error)
    return fail("Error interno del servidor", 500)
  }
}
