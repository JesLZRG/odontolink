import { supabaseAdmin } from "@/lib/supabase/admin"
import { fromCitaRow } from "@/lib/clinicas/store"
import type { Cita, EstadoCita } from "@/types"

// ============================================================
// Pacientes de una clinica, derivados de sus citas (no hay tabla
// propia de "pacientes": se agrupan las citas por correo, o por
// nombre si la cita se creo sin correo (agenda manual)).
// ============================================================

export interface PacienteResumen {
  id: string
  nombre: string
  email?: string
  telefono?: string
  totalCitas: number
  proximaCita?: string
  ultimaCita: string
  ultimoEstado: EstadoCita
}

export interface PacienteDetalle extends PacienteResumen {
  citas: Cita[]
}

function pacienteKey(cita: Cita): string {
  const email = cita.pacienteEmail?.trim().toLowerCase()
  if (email) return `email:${email}`
  return `nombre:${cita.pacienteNombre.trim().toLowerCase()}`
}

export function encodePacienteId(key: string): string {
  return Buffer.from(key, "utf8").toString("base64url")
}

export function decodePacienteId(id: string): string {
  return Buffer.from(id, "base64url").toString("utf8")
}

async function citasDeClinica(clinicaId: string): Promise<Cita[]> {
  const { data, error } = await supabaseAdmin()
    .from("citas")
    .select("*")
    .eq("clinica_id", clinicaId)
    .order("fecha", { ascending: false })
  if (error) throw error
  return (data as Parameters<typeof fromCitaRow>[0][]).map(fromCitaRow)
}

async function telefonosPorPacienteId(pacienteIds: string[]): Promise<Map<string, string>> {
  if (pacienteIds.length === 0) return new Map()
  const { data, error } = await supabaseAdmin()
    .from("usuarios")
    .select("id, telefono")
    .in("id", pacienteIds)
  if (error) throw error
  const map = new Map<string, string>()
  for (const row of data as { id: string; telefono: string | null }[]) {
    if (row.telefono) map.set(row.id, row.telefono)
  }
  return map
}

function proximaCitaDe(citas: Cita[]): Cita | undefined {
  const ahora = Date.now()
  return citas
    .filter((c) => c.estado !== "cancelada" && new Date(c.fecha).getTime() >= ahora)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0]
}

export async function listPacientesByClinica(clinicaId: string): Promise<PacienteResumen[]> {
  const citas = await citasDeClinica(clinicaId)

  const grupos = new Map<string, Cita[]>()
  for (const cita of citas) {
    const key = pacienteKey(cita)
    const lista = grupos.get(key)
    if (lista) lista.push(cita)
    else grupos.set(key, [cita])
  }

  const pacienteIds = Array.from(
    new Set(citas.map((c) => c.pacienteId).filter((id): id is string => !!id))
  )
  const telefonos = await telefonosPorPacienteId(pacienteIds)

  const resumenes: PacienteResumen[] = []
  for (const [key, lista] of grupos) {
    // citasDeClinica ya ordena por fecha desc, asi que lista[0] es la mas reciente
    const masReciente = lista[0]
    const proxima = proximaCitaDe(lista)
    resumenes.push({
      id: encodePacienteId(key),
      nombre: masReciente.pacienteNombre,
      email: masReciente.pacienteEmail,
      telefono: masReciente.pacienteId ? telefonos.get(masReciente.pacienteId) : undefined,
      totalCitas: lista.length,
      proximaCita: proxima?.fecha,
      ultimaCita: masReciente.fecha,
      ultimoEstado: masReciente.estado,
    })
  }

  return resumenes.sort((a, b) => new Date(b.ultimaCita).getTime() - new Date(a.ultimaCita).getTime())
}

export async function findPacienteByClinica(clinicaId: string, id: string): Promise<PacienteDetalle | null> {
  let key: string
  try {
    key = decodePacienteId(id)
  } catch {
    return null
  }

  const citas = await citasDeClinica(clinicaId)
  const propias = citas.filter((c) => pacienteKey(c) === key)
  if (propias.length === 0) return null

  const masReciente = propias[0]
  let telefono: string | undefined
  if (masReciente.pacienteId) {
    const telefonos = await telefonosPorPacienteId([masReciente.pacienteId])
    telefono = telefonos.get(masReciente.pacienteId)
  }
  const proxima = proximaCitaDe(propias)

  return {
    id,
    nombre: masReciente.pacienteNombre,
    email: masReciente.pacienteEmail,
    telefono,
    totalCitas: propias.length,
    proximaCita: proxima?.fecha,
    ultimaCita: masReciente.fecha,
    ultimoEstado: masReciente.estado,
    citas: propias,
  }
}
