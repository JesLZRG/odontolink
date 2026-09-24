import { createHmac, timingSafeEqual } from "node:crypto"
import type { UserRole } from "@/types"

// Token de sesion firmado con HMAC-SHA256: base64url(payload).base64url(firma)
// No depende de next/headers para poder usarse tambien desde proxy.ts

export const SESSION_COOKIE = "odontolink_session"

export interface SessionPayload {
  uid: string
  rol: UserRole
  sv: number // version de sesion: cambia al cambiar la contrasena e invalida sesiones anteriores
  exp: number // epoch en segundos
}

const DEV_SECRET = "odontolink-dev-secret-cambiar-en-produccion"

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET no esta configurado")
  }
  return DEV_SECRET
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url")
}

export function createSessionToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${data}.${sign(data)}`
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null
  const [data, signature] = token.split(".")
  if (!data || !signature) return null

  const expected = Buffer.from(sign(data))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}
