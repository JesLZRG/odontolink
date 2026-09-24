import { NextRequest, NextResponse } from "next/server"
import { fail, sendPasswordResetEmail } from "@/lib/auth/flows"
import { rateLimit } from "@/lib/auth/rate-limit"
import { emailSchema } from "@/lib/auth/schemas"
import { findUserByEmail, normalizeEmail } from "@/lib/auth/store"

export async function POST(request: NextRequest) {
  try {
    const parsed = emailSchema.safeParse((await request.json()).email)
    if (!parsed.success) return fail("Ingresa un correo valido", 400)

    if (!rateLimit(`recuperar:${normalizeEmail(parsed.data)}`, 3, 15 * 60_000)) {
      return fail("Ya enviamos varios correos. Espera unos minutos.", 429)
    }

    const user = await findUserByEmail(parsed.data)
    if (user) await sendPasswordResetEmail(user, request.nextUrl.origin)

    // Respuesta generica para no revelar que correos estan registrados
    return NextResponse.json({
      success: true,
      message: "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contrasena.",
    })
  } catch (error) {
    console.error("Recuperar error:", error)
    return fail("Error interno del servidor", 500)
  }
}
