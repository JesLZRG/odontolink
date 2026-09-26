// ============================================================
// OdontoLink -- Global Type Definitions
// i18n-ready: all UI strings go through translation keys
// ============================================================

export type UserRole = "paciente" | "clinica" | "admin" | "doctor"

// Datos publicos de una cuenta (nunca incluye el hash de la contrasena)
export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: UserRole
  telefono?: string
  ciudad?: string
  clinicaId?: string
  doctorId?: string
  activo: boolean
  emailVerificado: boolean
  creadoEn: string
}

export interface Clinica {
  id: string
  nombre: string
  slug: string
  descripcion: string
  direccion: string
  ciudad: string
  telefono: string
  email: string
  sitioWeb?: string
  imagen: string
  rating: number
  totalResenas: number
  idiomas: Idioma[]
  especialidades: Especialidad[]
  aseguradoras: Aseguradora[]
  verificada: boolean
  estadoAprobacion: EstadoAprobacionClinica
  planSuscripcion: "basico" | "profesional" | "premium"
  horario: HorarioSemana
  coordenadas: { lat: number; lng: number }
}

export type EstadoAprobacionClinica = "pendiente" | "aprobada" | "rechazada"

export type Idioma = "es" | "en"

export type Especialidad =
  | "ortodoncia"
  | "implantes"
  | "estetica"
  | "endodoncia"
  | "cirugia"
  | "pediatrica"
  | "periodoncia"
  | "general"

export type Aseguradora =
  | "blue_cross"
  | "aetna"
  | "cigna"
  | "humana"
  | "united_health"
  | "medicare"
  | "medicaid"
  | "metlife"

export interface HorarioSemana {
  lunes?: HorarioDia
  martes?: HorarioDia
  miercoles?: HorarioDia
  jueves?: HorarioDia
  viernes?: HorarioDia
  sabado?: HorarioDia
  domingo?: HorarioDia
}

export interface HorarioDia {
  abre: string
  cierra: string
}

export interface Cita {
  id: string
  pacienteId: string
  pacienteNombre: string
  pacienteEmail?: string
  pacienteAvatar?: string
  clinicaId: string
  doctorId: string
  doctorNombre: string
  fecha: string
  duracionMinutos: number
  tratamiento: Especialidad
  estado: EstadoCita
  notas?: string
  esTurismo: boolean
  esDemo: boolean
}

export type EstadoCita =
  | "programada"
  | "confirmada"
  | "en_curso"
  | "completada"
  | "cancelada"
  | "no_asistio"

export interface Paciente {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaNacimiento: string
  pais: string
  idioma: Idioma
  aseguradora?: Aseguradora
  numeroPoliza?: string
  avatar?: string
  clinicaId?: string
}

export interface Doctor {
  id: string
  nombre: string
  apellido: string
  especialidad: Especialidad
  clinicaId: string
  avatar?: string
  idiomas: Idioma[]
  cedula: string
}

export interface DashboardStats {
  citasHoy: number
  citasHoyTrend: number | null
  pacientesActivos: number
  pacientesActivosTrend: number | null
  ingresosMes: number
  mensajesNuevos: number
  citasSemana: number
  tasaOcupacion: number | null
}

export interface FiltrosDirectorio {
  busqueda: string
  idiomas: Idioma[]
  especialidades: Especialidad[]
  aseguradoras: Aseguradora[]
  soloVerificadas: boolean
  ratingMinimo: number
}

export interface ExpedienteHistorialEntrada {
  id: string
  doctorId: string
  doctorNombre: string
  notasAnteriores: string
  notasNuevas: string
  creadoEn: string
}

export interface Expediente {
  id: string
  clinicaId: string
  pacienteId: string
  notas: string
  actualizadoEn: string
  actualizadoPorNombre?: string
  historial: ExpedienteHistorialEntrada[]
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  meta?: {
    total: number
    pagina: number
    porPagina: number
  }
}
