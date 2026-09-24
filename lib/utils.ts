import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string, locale = "es-MX"): string {
  return new Date(dateString).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Las citas se guardan como hora "de pared" de la clinica sin zona horaria
// real (ver lib/clinicas/store.ts). Por eso se muestran siempre en UTC: si
// se formatearan en la zona horaria del navegador, la hora se correria segun
// donde este el visitante (ej. 9:30am guardado se veria como 2:30am en un
// navegador en UTC-7).
export function formatTime(dateString: string, locale = "es-MX"): string {
  return new Date(dateString).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })
}

export function getInitials(nombre: string): string {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const IDIOMA_LABELS: Record<string, string> = {
  es: "Espanol",
  en: "English",
}

export const ESPECIALIDAD_LABELS: Record<string, string> = {
  ortodoncia: "Ortodoncia",
  implantes: "Implantes",
  estetica: "Estetica",
  endodoncia: "Endodoncia",
  cirugia: "Cirugia Oral",
  pediatrica: "Odontopediatria",
  periodoncia: "Periodoncia",
  general: "Odontologia General",
}

export const ASEGURADORA_LABELS: Record<string, string> = {
  blue_cross: "Blue Cross Blue Shield",
  aetna: "Aetna",
  cigna: "Cigna",
  humana: "Humana",
  united_health: "UnitedHealth",
  medicare: "Medicare",
  medicaid: "Medicaid",
  metlife: "MetLife Dental",
}

export const ESTADO_CITA_LABELS: Record<string, string> = {
  programada: "Programada",
  confirmada: "Confirmada",
  en_curso: "En Curso",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No Asistio",
}

export const ESTADO_CITA_COLORS: Record<string, string> = {
  programada: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  confirmada: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  en_curso: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  completada: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  cancelada: "bg-red-500/20 text-red-400 border-red-500/30",
  no_asistio: "bg-orange-500/20 text-orange-400 border-orange-500/30",
}
