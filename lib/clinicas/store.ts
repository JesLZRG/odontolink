import { randomUUID } from "node:crypto"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  Aseguradora,
  Cita,
  Clinica,
  EstadoAprobacionClinica,
  Especialidad,
  EstadoCita,
  HorarioSemana,
  Idioma,
} from "@/types"

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
  estado_aprobacion: EstadoAprobacionClinica
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
    estadoAprobacion: row.estado_aprobacion,
    planSuscripcion: row.plan_suscripcion,
    horario: row.horario ?? {},
    coordenadas: { lat: row.lat ?? 0, lng: row.lng ?? 0 },
  }
}

// Solo clinicas aprobadas: el directorio publico nunca muestra pendientes ni rechazadas.
export async function listClinicas(): Promise<Clinica[]> {
  const { data, error } = await supabaseAdmin().from("clinicas").select("*").eq("estado_aprobacion", "aprobada")
  if (error) throw error
  return (data as ClinicaRow[]).map(fromClinicaRow)
}

export async function listClinicasPendientes(): Promise<Clinica[]> {
  const { data, error } = await supabaseAdmin()
    .from("clinicas")
    .select("*")
    .eq("estado_aprobacion", "pendiente")
    .order("creado_en", { ascending: true })
  if (error) throw error
  return (data as ClinicaRow[]).map(fromClinicaRow)
}

export async function updateClinicaEstadoAprobacion(
  id: string,
  estado: EstadoAprobacionClinica
): Promise<Clinica | null> {
  const { data, error } = await supabaseAdmin()
    .from("clinicas")
    .update({ estado_aprobacion: estado })
    .eq("id", id)
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? fromClinicaRow(data as ClinicaRow) : null
}

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export interface NuevaClinica {
  nombre: string
  ciudad: string
  telefono: string
  email: string
  direccion: string
  descripcion: string
  imagen: string
}

// Crea la clinica que corresponde a una cuenta recien registrada. Nace
// "pendiente" (columna con default en la base de datos) y no aparece en el
// directorio ni puede recibir citas hasta que un admin la apruebe en /admin.
export async function createClinica(data: NuevaClinica): Promise<Clinica> {
  const id = randomUUID()
  const slugBase = slugify(data.nombre) || "clinica"
  const slug = `${slugBase}-${id.slice(0, 8)}`

  const { data: row, error } = await supabaseAdmin()
    .from("clinicas")
    .insert({
      id,
      nombre: data.nombre,
      slug,
      descripcion: data.descripcion,
      direccion: data.direccion,
      ciudad: data.ciudad,
      telefono: data.telefono,
      email: data.email,
      imagen: data.imagen,
      idiomas: ["es"],
      especialidades: [],
      aseguradoras: [],
      horario: {},
    })
    .select()
    .single()
  if (error) throw error
  return fromClinicaRow(row as ClinicaRow)
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
  especialidades: string[]
  clinicaId: string
  activo: boolean
}

interface DoctorRow {
  id: string
  nombre: string
  especialidades: string[]
  clinica_id: string
  activo: boolean
}

export function fromDoctorRow(row: DoctorRow): DoctorPublic {
  return {
    id: row.id,
    nombre: row.nombre,
    especialidades: row.especialidades,
    clinicaId: row.clinica_id,
    activo: row.activo,
  }
}

export async function listDoctoresByClinica(clinicaId: string): Promise<DoctorPublic[]> {
  const { data, error } = await supabaseAdmin()
    .from("doctores")
    .select("id, nombre, especialidades, clinica_id, activo")
    .eq("clinica_id", clinicaId)
    .eq("activo", true)
  if (error) throw error
  return (data as DoctorRow[]).map(fromDoctorRow)
}

export async function findDoctorById(id: string): Promise<DoctorPublic | null> {
  const { data, error } = await supabaseAdmin()
    .from("doctores")
    .select("id, nombre, especialidades, clinica_id, activo")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data ? fromDoctorRow(data as DoctorRow) : null
}

// ---------- Equipo (gestion de doctores desde el panel de la clinica) ----------

export interface MiembroEquipo {
  doctorId: string
  usuarioId: string
  nombre: string
  email: string
  especialidades: string[]
  activo: boolean
  creadoEn: string
}

export async function listEquipoByClinica(clinicaId: string): Promise<MiembroEquipo[]> {
  const { data, error } = await supabaseAdmin()
    .from("usuarios")
    .select("id, email, nombre, activo, creado_en, doctor_id, doctores!inner(id, especialidades, clinica_id)")
    .eq("rol", "doctor")
    .eq("doctores.clinica_id", clinicaId)
    .order("creado_en", { ascending: false })
  if (error) throw error

  type Row = {
    id: string
    email: string
    nombre: string
    activo: boolean
    creado_en: string
    doctor_id: string
    doctores: { id: string; especialidades: string[]; clinica_id: string }
  }

  return (data as unknown as Row[]).map((row) => ({
    doctorId: row.doctor_id,
    usuarioId: row.id,
    nombre: row.nombre,
    email: row.email,
    especialidades: row.doctores.especialidades,
    activo: row.activo,
    creadoEn: row.creado_en,
  }))
}

// Perfiles de doctores que ya existen (por ejemplo, de la semilla original o
// de citas cargadas antes de que existiera el login de doctores) pero que
// todavia no tienen cuenta de acceso. Se muestran aparte en /dashboard/equipo
// para "darles acceso" sin crear un perfil duplicado.
export async function listDoctoresSinCuenta(clinicaId: string): Promise<DoctorPublic[]> {
  const client = supabaseAdmin()
  const { data: doctores, error } = await client
    .from("doctores")
    .select("id, nombre, especialidades, clinica_id, activo")
    .eq("clinica_id", clinicaId)
  if (error) throw error

  const { data: cuentas, error: cuentasError } = await client
    .from("usuarios")
    .select("doctor_id")
    .not("doctor_id", "is", null)
  if (cuentasError) throw cuentasError

  const conCuenta = new Set((cuentas as { doctor_id: string }[]).map((u) => u.doctor_id))
  return (doctores as DoctorRow[]).filter((d) => !conCuenta.has(d.id)).map(fromDoctorRow)
}

export interface NuevoDoctor {
  clinicaId: string
  nombre: string
  especialidades: string[]
  idiomas?: string[]
}

// Crea el registro de perfil en "doctores" (sin credenciales). La cuenta de
// acceso (usuarios, rol "doctor") se crea por separado en el mismo flujo.
export async function createDoctor(data: NuevoDoctor): Promise<DoctorPublic> {
  const id = randomUUID()
  const { data: row, error } = await supabaseAdmin()
    .from("doctores")
    .insert({
      id,
      clinica_id: data.clinicaId,
      nombre: data.nombre,
      especialidades: data.especialidades,
      idiomas: data.idiomas ?? [],
    })
    .select("id, nombre, especialidades, clinica_id, activo")
    .single()
  if (error) throw error
  return fromDoctorRow(row as DoctorRow)
}

// Activa/desactiva el perfil del doctor y, en cascada, su cuenta de acceso.
export async function setDoctorActivo(doctorId: string, clinicaId: string, activo: boolean): Promise<boolean> {
  const client = supabaseAdmin()
  const { data: doctor, error: findError } = await client
    .from("doctores")
    .select("id")
    .eq("id", doctorId)
    .eq("clinica_id", clinicaId)
    .maybeSingle()
  if (findError) throw findError
  if (!doctor) return false

  const { error: doctorError } = await client.from("doctores").update({ activo }).eq("id", doctorId)
  if (doctorError) throw doctorError

  const { error: usuarioError } = await client.from("usuarios").update({ activo }).eq("doctor_id", doctorId)
  if (usuarioError) throw usuarioError

  return true
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

export async function findCitaById(id: string): Promise<Cita | null> {
  const { data, error } = await supabaseAdmin().from("citas").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data ? fromCitaRow(data as CitaRow) : null
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
