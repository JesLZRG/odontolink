import { createHash, randomBytes } from "node:crypto"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { UserRole, Usuario } from "@/types"
import { hashPassword } from "./password"

// ============================================================
// Almacen de cuentas respaldado por Supabase (Postgres).
// Usa la service role key desde el servidor (nunca se expone al navegador).
// Esquema: sql/schema.sql (ejecutalo una vez en el SQL Editor de Supabase).
// ============================================================

export interface UsuarioRecord extends Usuario {
  passwordHash: string
  sessionVersion: number
}

export type TokenTipo = "verificar_email" | "restablecer_password"

// Fila cruda de la tabla "usuarios" (snake_case) -> UsuarioRecord (camelCase)
interface UsuarioRow {
  id: string
  email: string
  nombre: string
  rol: UserRole
  telefono: string | null
  ciudad: string | null
  clinica_id: string | null
  email_verificado: boolean
  creado_en: string
  password_hash: string
  session_version: number
}

function fromRow(row: UsuarioRow): UsuarioRecord {
  return {
    id: row.id,
    email: row.email,
    nombre: row.nombre,
    rol: row.rol,
    telefono: row.telefono ?? undefined,
    ciudad: row.ciudad ?? undefined,
    clinicaId: row.clinica_id ?? undefined,
    emailVerificado: row.email_verificado,
    creadoEn: row.creado_en,
    passwordHash: row.password_hash,
    sessionVersion: row.session_version,
  }
}

export function toPublic(user: UsuarioRecord): Usuario {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, sessionVersion, ...publico } = user
  return publico
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

// ---------- Semilla de cuentas demo (se crean una sola vez, si la tabla esta vacia) ----------

let seedPromise: Promise<void> | null = null

function ensureSeed(): Promise<void> {
  if (!seedPromise) seedPromise = seedIfEmpty().catch((err) => { seedPromise = null; throw err })
  return seedPromise
}

async function seedIfEmpty() {
  const { count, error } = await supabaseAdmin()
    .from("usuarios")
    .select("id", { count: "exact", head: true })
  if (error) throw error
  if ((count ?? 0) > 0) return

  const passwordHash = await hashPassword("Demo1234!")
  const creadoEn = new Date().toISOString()
  const { error: insertError } = await supabaseAdmin().from("usuarios").insert([
    { email: "paciente@demo.com", nombre: "Ana Torres", rol: "paciente", telefono: "6641234567", email_verificado: true, creado_en: creadoEn, password_hash: passwordHash, session_version: 0 },
    { email: "clinica@demo.com", nombre: "Sonrisa Perfecta Dental", rol: "clinica", ciudad: "Tijuana, B.C.", clinica_id: "1", email_verificado: true, creado_en: creadoEn, password_hash: passwordHash, session_version: 0 },
  ])
  // No revienta el registro/login si la insercion choca con una carrera entre instancias
  if (insertError && insertError.code !== "23505") throw insertError
}

// ---------- Usuarios ----------

export async function findUserByEmail(email: string): Promise<UsuarioRecord | null> {
  await ensureSeed()
  const { data, error } = await supabaseAdmin()
    .from("usuarios")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle()
  if (error) throw error
  return data ? fromRow(data as UsuarioRow) : null
}

export async function findUserById(id: string): Promise<UsuarioRecord | null> {
  const { data, error } = await supabaseAdmin().from("usuarios").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data ? fromRow(data as UsuarioRow) : null
}

export async function listUsersByRole(rol: UserRole): Promise<UsuarioRecord[]> {
  const { data, error } = await supabaseAdmin()
    .from("usuarios")
    .select("*")
    .eq("rol", rol)
    .order("creado_en", { ascending: false })
  if (error) throw error
  return (data as UsuarioRow[]).map(fromRow)
}

export interface NuevoUsuario {
  email: string
  nombre: string
  rol: UserRole
  passwordHash: string
  telefono?: string
  ciudad?: string
}

export async function createUser(data: NuevoUsuario): Promise<UsuarioRecord | null> {
  await ensureSeed()
  const { data: row, error } = await supabaseAdmin()
    .from("usuarios")
    .insert({
      email: normalizeEmail(data.email),
      nombre: data.nombre,
      rol: data.rol,
      password_hash: data.passwordHash,
      telefono: data.telefono ?? null,
      ciudad: data.ciudad ?? null,
      // Sin dominio propio verificado en Resend no podemos garantizar la entrega
      // del correo de confirmacion, asi que las cuentas quedan activas de inmediato.
      email_verificado: true,
      session_version: 0,
    })
    .select()
    .maybeSingle()
  if (error) {
    if (error.code === "23505") return null // correo ya registrado (constraint unique)
    throw error
  }
  return row ? fromRow(row as UsuarioRow) : null
}

export async function updateUser(
  id: string,
  changes: Partial<Omit<UsuarioRecord, "id" | "email" | "creadoEn">>
): Promise<UsuarioRecord | null> {
  const patch: Record<string, unknown> = {}
  if (changes.nombre !== undefined) patch.nombre = changes.nombre
  if (changes.rol !== undefined) patch.rol = changes.rol
  if (changes.telefono !== undefined) patch.telefono = changes.telefono ?? null
  if (changes.ciudad !== undefined) patch.ciudad = changes.ciudad ?? null
  if (changes.clinicaId !== undefined) patch.clinica_id = changes.clinicaId ?? null
  if (changes.emailVerificado !== undefined) patch.email_verificado = changes.emailVerificado
  if (changes.passwordHash !== undefined) patch.password_hash = changes.passwordHash
  if (changes.sessionVersion !== undefined) patch.session_version = changes.sessionVersion

  const { data, error } = await supabaseAdmin().from("usuarios").update(patch).eq("id", id).select().maybeSingle()
  if (error) throw error
  return data ? fromRow(data as UsuarioRow) : null
}

export async function deleteUser(id: string): Promise<void> {
  // auth_tokens tiene ON DELETE CASCADE sobre user_id, se borran solos
  const { error } = await supabaseAdmin().from("usuarios").delete().eq("id", id)
  if (error) throw error
}

// ---------- Tokens de un solo uso (verificacion y restablecimiento) ----------

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

export async function createToken(userId: string, tipo: TokenTipo, ttlMinutos: number): Promise<string> {
  const token = randomBytes(32).toString("hex")
  const expiraEn = new Date(Date.now() + ttlMinutos * 60_000).toISOString()

  const client = supabaseAdmin()
  // Un solo token vigente por usuario y tipo; limpia ademas los ya expirados (best-effort)
  await client.from("auth_tokens").delete().eq("user_id", userId).eq("tipo", tipo)
  await client.from("auth_tokens").delete().lt("expira_en", new Date().toISOString())

  const { error } = await client
    .from("auth_tokens")
    .insert({ token_hash: hashToken(token), user_id: userId, tipo, expira_en: expiraEn })
  if (error) throw error
  return token
}

// Devuelve el userId si el token es valido y lo elimina (uso unico, delete atomico)
export async function consumeToken(token: string, tipo: TokenTipo): Promise<string | null> {
  const { data, error } = await supabaseAdmin()
    .from("auth_tokens")
    .delete()
    .eq("token_hash", hashToken(token))
    .eq("tipo", tipo)
    .select("user_id, expira_en")
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return new Date(data.expira_en).getTime() > Date.now() ? data.user_id : null
}
