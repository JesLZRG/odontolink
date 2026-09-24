import { cookies } from "next/headers"
import type { UserRole } from "@/types"
import { findUserById, type UsuarioRecord } from "./store"
import { SESSION_COOKIE, createSessionToken, verifySessionToken } from "./token"

const DIA = 60 * 60 * 24

export async function startSession(user: UsuarioRecord, recordarme: boolean) {
  // "Recordarme": cookie persistente de 30 dias; si no, cookie de sesion del navegador (max 1 dia)
  const duracion = recordarme ? 30 * DIA : DIA
  const token = createSessionToken({
    uid: user.id,
    rol: user.rol,
    sv: user.sessionVersion,
    exp: Math.floor(Date.now() / 1000) + duracion,
  })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(recordarme ? { maxAge: duracion } : {}),
  })
}

export async function endSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// Usuario autenticado actual, o null. Valida firma, expiracion y version de sesion.
export async function getCurrentUser(): Promise<UsuarioRecord | null> {
  const cookieStore = await cookies()
  const payload = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)
  if (!payload) return null
  const user = await findUserById(payload.uid)
  if (!user || user.sessionVersion !== payload.sv) return null
  return user
}

export function homeForRole(rol: UserRole) {
  if (rol === "clinica") return "/dashboard"
  if (rol === "admin") return "/admin"
  return "/directorio"
}
