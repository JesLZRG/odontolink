import { NextResponse } from "next/server"
import type { ZodError } from "zod"
import { appUrl, enviarCorreoRestablecer, enviarCorreoVerificacion } from "./mailer"
import { createToken, type UsuarioRecord } from "./store"

export async function sendVerificationEmail(user: UsuarioRecord, origin: string) {
  const token = await createToken(user.id, "verificar_email", 24 * 60)
  await enviarCorreoVerificacion(user.email, user.nombre, `${appUrl(origin)}/api/auth/verificar?token=${token}`)
}

export async function sendPasswordResetEmail(user: UsuarioRecord, origin: string) {
  const token = await createToken(user.id, "restablecer_password", 60)
  await enviarCorreoRestablecer(user.email, user.nombre, `${appUrl(origin)}/restablecer?token=${token}`)
}

export function fail(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, message, ...extra }, { status })
}

export function validationFail(error: ZodError) {
  return fail(error.issues[0]?.message ?? "Datos invalidos", 400)
}

// Solo permite redirecciones internas (evita open redirects)
export function safeRedirect(next: unknown): string | null {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : null
}
