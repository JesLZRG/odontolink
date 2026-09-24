import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Aseguradora, Cita, Clinica, Especialidad, EstadoCita, HorarioSemana, Idioma } from "@/types"

// ============================================================
// Almacen de clinicas, doctores y citas respaldado por Supabase.
// Esquema: sql/003_clinicas_doctores_citas.sql
// ============================================================

interface ClinicaRow {
  id: string
  nombre: string
  slug: string
  descripcion: string
  direccion: string
  ciudad: string
  telefono: string
  email: string
  sitio_web: string | null
  imagen: string
  rating: number
  total_resenas: number
  idiomas: string[]
  especialidades: string[]
  aseguradoras: string[]
  verificada: boolean
  plan_suscripcion: Clinica["planSuscripcion"]
  horario: HorarioSemana
  lat: number | null
  lng: number | null
}

export function fromClinicaRow(row: ClinicaRow): Clinica {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    descripcion: row.descripcion,
    direccion: row.direccion,
    ciudad: row.ciudad,
    telefono: row.telefono,
    email: row.email,
    sitioWeb: row.sitio_web ?? undefined,
    imagen: row.imagen,
    rating: Number(row.rating),
    totalResenas: row.total_resenas,
    idiomas: row.idiomas as Idioma[],
    especialidades: row.especialidades as Especialidad[],
    aseguradoras: row.aseguradoras as Aseguradora[],
    verificada: row.verificada,
    planSuscripcion: row.plan_suscripcion,
    horario: row.horario ?? {},
    coordenadas: { lat: row.lat ?? 0, lng: row.lng ?? 0 },
  }
}

export async function listClinicas(): Promise<Clinica[]> {
  const { data, error } = await supabaseAdmin().from("clinicas").select("*")
  if (error) throw error
  return (data as ClinicaRow[]).map(fromClinicaRow)
}

export async function findClinicaByIdOrSlug(idOrSlug: string): Promise<Clinica | null> {
  const client = supabaseAdmin()
  const { data: bySlug, error: slugError } = await client
    .from("clinicas")
    .select("*")
    .eq("slug", idOrSlug)
    .maybeSingle()
  if (slugError) throw slugError
  if (bySlug) return fromClinicaRow(bySlug as ClinicaRow)

  const { data: byId, error: idError } = await client
    .from("clinicas")
    .select("*")
    .eq("id", idOrSlug)
    .maybeSingle()
  if (idError) throw idError
  return byId ? fromClinicaRow(byId as ClinicaRow) : null
}

// ---------- Doctores ----------

export interface DoctorPublic {
  id: string
  nombre: string
  especialidad: string
  clinicaId: string
}

interface DoctorRow {
  id: string
  nombre: string
  especialidad: string
  clinica_id: string
}

export function fromDoctorRow(row: DoctorRow): DoctorPublic {
  return { id: row.id, nombre: row.nombre, especialidad: row.especialidad, clinicaId: row.clinica_id }
}

export async function listDoctoresByClinica(clinicaId: string): Promise<DoctorPublic[]> {
  const { data, error } = await supabaseAdmin()
    .from("doctores")
    .select("id, nombre, especialidad, clinica_id")
    .eq("clinica_id", clinicaId)
  if (error) throw error
  return (data as DoctorRow[]).map(fromDoctorRow)
}

export async function findDoctorById(id: string): Promise<DoctorPublic | null> {
  const { data, error } = await supabaseAdmin()
    .from("doctores")
    .select("id, nombre, especialidad, clinica_id")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data ? fromDoctorRow(data as DoctorRow) : null
}

// ---------- Citas ----------

interface CitaRow {
  id: string
  clinica_id: string
  doctor_id: string | null
  doctor_nombre: string
  paciente_id: string | null
  paciente_nombre: string
  paciente_email: string | null
  paciente_avatar: string | null
  fecha: string
  duracion_minutos: number
  tratamiento: string
  estado: EstadoCita
  notas: string | null
  es_turismo: boolean
  es_demo: boolean
}

export function fromCitaRow(row: CitaRow): Cita {
  return {
    id: row.id,
    pacienteId: row.paciente_id ?? "",
    pacienteNombre: row.paciente_nombre,
    pacienteEmail: row.paciente_email ?? undefined,
    pacienteAvatar: row.paciente_avatar ?? undefined,
    clinicaId: row.clinica_id,
    doctorId: row.doctor_id ?? "",
    doctorNombre: row.doctor_nombre,
    fecha: row.fecha,
    duracionMinutos: row.duracion_minutos,
    tratamiento: row.tratamiento as Especialidad,
    estado: row.estado,
    notas: row.notas ?? undefined,
    esTurismo: row.es_turismo,
    esDemo: row.es_demo,
  }
}

// Rango [inicio, fin) de un dia "YYYY-MM-DD"
export function diaRange(dia: string): [string, string] {
  const inicio = new Date(`${dia}T00:00:00.000Z`)
  const fin = new Date(inicio)
  fin.setUTCDate(fin.getUTCDate() + 1)
  return [inicio.toISOString(), fin.toISOString()]
}

// Rango [inicio, fin) de un mes "YYYY-MM"
export function mesRange(mes: string): [string, string] {
  const [anio, mesNum] = mes.split("-").map(Number)
  const inicio = new Date(Date.UTC(anio, mesNum - 1, 1))
  const fin = new Date(Date.UTC(anio, mesNum, 1))
  return [inicio.toISOString(), fin.toISOString()]
}

export interface NuevaCita {
  clinicaId: string
  doctorId: string
  doctorNombre: string
  pacienteId?: string
  pacienteNombre: string
  pacienteEmail?: string
  pacienteAvatar?: string
  fecha: string
  duracionMinutos: number
  tratamiento: string
  notas?: string
  esTurismo?: boolean
}

export async function createCita(data: NuevaCita): Promise<Cita> {
  const { data: row, error } = await supabaseAdmin()
    .from("citas")
    .insert({
      clinica_id: data.clinicaId,
      doctor_id: data.doctorId,
      doctor_nombre: data.doctorNombre,
      paciente_id: data.pacienteId ?? null,
      paciente_nombre: data.pacienteNombre,
      paciente_email: data.pacienteEmail ?? null,
      paciente_avatar: data.pacienteAvatar ?? null,
      fecha: data.fecha,
      duracion_minutos: data.duracionMinutos,
      tratamiento: data.tratamiento,
      estado: "programada",
      notas: data.notas ?? null,
      es_turismo: data.esTurismo ?? false,
    })
    .select()
    .single()
  if (error) throw error
  return fromCitaRow(row as CitaRow)
}

// Citas no canceladas de un doctor en un dia dado, para calcular horarios libres
export async function listCitasOcupadasDoctorDia(
  doctorId: string,
  fechaDia: string
): Promise<{ fecha: string; duracionMinutos: number }[]> {
  const [inicio, fin] = diaRange(fechaDia)
  const { data, error } = await supabaseAdmin()
    .from("citas")
    .select("fecha, duracion_minutos")
    .eq("doctor_id", doctorId)
    .neq("estado", "cancelada")
    .gte("fecha", inicio)
    .lt("fecha", fin)
  if (error) throw error
  return (data as { fecha: string; duracion_minutos: number }[]).map((r) => ({
    fecha: r.fecha,
    duracionMinutos: r.duracion_minutos,
  }))
}

// Cita con el nombre de la clinica ya resuelto (join), para vistas que
// muestran citas de varias clinicas a la vez (admin, mis-citas del paciente)
export interface CitaConClinica extends Cita {
  clinicaNombre: string
}

function fromCitaRowConClinica(row: CitaRow & { clinicas: { nombre: string } | null }): CitaConClinica {
  return { ...fromCitaRow(row), clinicaNombre: row.clinicas?.nombre ?? row.clinica_id }
}

// Todas las citas del sistema (para el panel admin)
export async function listAllCitasAdmin(): Promise<CitaConClinica[]> {
  const { data, error } = await supabaseAdmin()
    .from("citas")
    .select("*, clinicas(nombre)")
    .order("fecha", { ascending: false })
    .limit(200)
  if (error) throw error
  return (data as (CitaRow & { clinicas: { nombre: string } | null })[]).map(fromCitaRowConClinica)
}

// Citas de un paciente especifico (para "Mis citas")
export async function listCitasByPaciente(pacienteId: string): Promise<CitaConClinica[]> {
  const { data, error } = await supabaseAdmin()
    .from("citas")
    .select("*, clinicas(nombre)")
    .eq("paciente_id", pacienteId)
    .order("fecha", { ascending: false })
  if (error) throw error
  return (data as (CitaRow & { clinicas: { nombre: string } | null })[]).map(fromCitaRowConClinica)
}

export interface ActualizarCita {
  pacienteNombre?: string
  doctorId?: string
  doctorNombre?: string
  fecha?: string
  duracionMinutos?: number
  tratamiento?: string
  notas?: string
  esTurismo?: boolean
  estado?: EstadoCita
}

export async function updateCita(id: string, changes: ActualizarCita): Promise<Cita | null> {
  const patch: Record<string, unknown> = {}
  if (changes.pacienteNombre !== undefined) patch.paciente_nombre = changes.pacienteNombre
  if (changes.doctorId !== undefined) patch.doctor_id = changes.doctorId
  if (changes.doctorNombre !== undefined) patch.doctor_nombre = changes.doctorNombre
  if (changes.fecha !== undefined) patch.fecha = changes.fecha
  if (changes.duracionMinutos !== undefined) patch.duracion_minutos = changes.duracionMinutos
  if (changes.tratamiento !== undefined) patch.tratamiento = changes.tratamiento
  if (changes.notas !== undefined) patch.notas = changes.notas
  if (changes.esTurismo !== undefined) patch.es_turismo = changes.esTurismo
  if (changes.estado !== undefined) patch.estado = changes.estado

  const { data, error } = await supabaseAdmin().from("citas").update(patch).eq("id", id).select().maybeSingle()
  if (error) throw error
  return data ? fromCitaRow(data as CitaRow) : null
}
