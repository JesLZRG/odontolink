import { NextRequest, NextResponse } from "next/server"
import { fail, sendVerificationEmail } from "@/lib/auth/flows"
import { rateLimit } from "@/lib/auth/rate-limit"
import { emailSchema } from "@/lib/auth/schemas"
import { findUserByEmail, normalizeEmail } from "@/lib/auth/store"

export async function POST(request: NextRequest) {
  try {
    const parsed = emailSchema.safeParse((await request.json()).email)
    if (!parsed.success) return fail("Ingresa un correo valido", 400)

    if (!rateLimit(`reenviar:${normalizeEmail(parsed.data)}`, 3, 15 * 60_000)) {
      return fail("Ya enviamos varios correos. Espera unos minutos.", 429)
    }

    const user = await findUserByEmail(parsed.data)
    if (user && !user.emailVerificado) {
      await sendVerificationEmail(user, request.nextUrl.origin)
    }
    // Respuesta generica para no revelar que correos estan registrados
    return NextResponse.json({
      success: true,
      message: "Si la cuenta existe y no esta confirmada, te enviamos un nuevo enlace.",
    })
  } catch (error) {
    console.error("Reenviar verificacion error:", error)
    return fail("Error interno del servidor", 500)
  }
}
