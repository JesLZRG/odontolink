import { NextRequest, NextResponse } from "next/server"
import { fail, safeRedirect, validationFail } from "@/lib/auth/flows"
import { verifyPassword } from "@/lib/auth/password"
import { rateLimit, resetRateLimit } from "@/lib/auth/rate-limit"
import { loginSchema } from "@/lib/auth/schemas"
import { homeForRole, startSession } from "@/lib/auth/session"
import { findUserByEmail, normalizeEmail, toPublic } from "@/lib/auth/store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return validationFail(parsed.error)
    const { email, password, rol, recordarme } = parsed.data

    const limitKey = `login:${normalizeEmail(email)}`
    if (!rateLimit(limitKey, 10, 15 * 60_000)) {
      return fail("Demasiados intentos. Espera unos minutos e intenta de nuevo.", 429)
    }

    const user = await findUserByEmail(email)
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return fail("Correo o contrasena incorrectos", 401)
    }
    // El rol "admin" no aparece en el selector publico (paciente/clinica), asi que
    // esas cuentas pueden iniciar sesion sin importar cual pestana este seleccionada.
    if (user.rol !== rol && user.rol !== "admin") {
      const tipo = user.rol === "clinica" ? "Clinica" : "Paciente"
      return fail(`Esta cuenta es de tipo ${tipo}. Selecciona "${tipo}" arriba para ingresar.`, 403)
    }
    if (!user.emailVerificado) {
      return fail("Debes confirmar tu correo antes de iniciar sesion.", 403, { code: "EMAIL_NO_VERIFICADO" })
    }

    resetRateLimit(limitKey)
    await startSession(user, recordarme ?? false)

    return NextResponse.json({
      success: true,
      data: {
        user: toPublic(user),
        redirectTo: safeRedirect(body.next) ?? homeForRole(user.rol),
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return fail("Error interno del servidor", 500)
  }
}
