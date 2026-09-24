import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUser } from "@/lib/auth/session"
import type { ApiResponse, DashboardStats, HorarioSemana } from "@/types"

const DIAS_SEMANA: (keyof HorarioSemana)[] = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
]

function inicioDeSemana(base: Date): Date {
  const dia = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()))
  const offset = (dia.getUTCDay() + 6) % 7 // lunes = 0
  dia.setUTCDate(dia.getUTCDate() - offset)
  return dia
}

function minutosDesdeHora(hora: string): number {
  const [h, m] = hora.split(":").map(Number)
  return h * 60 + (m || 0)
}

// Cambio porcentual entre dos periodos. null cuando no hay base para comparar.
function cambioPorcentual(actual: number, anterior: number): number | null {
  if (anterior === 0) return actual === 0 ? 0 : null
  return Math.round(((actual - anterior) / anterior) * 100)
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.clinicaId) {
      return NextResponse.json({ data: null, success: false, message: "No autenticado" }, { status: 401 })
    }
    const clinicaId = user.clinicaId
    const client = supabaseAdmin()

    const hoy = new Date()
    const inicioHoy = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()))
    const finHoy = new Date(inicioHoy)
    finHoy.setUTCDate(finHoy.getUTCDate() + 1)

    const inicioAyer = new Date(inicioHoy)
    inicioAyer.setUTCDate(inicioAyer.getUTCDate() - 1)

    const inicioSemana = inicioDeSemana(hoy)
    const finSemana = new Date(inicioSemana)
    finSemana.setUTCDate(finSemana.getUTCDate() + 7)

    const inicioMes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1))
    const finMes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 1))
    const inicioMesAnterior = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - 1, 1))

    const [
      { count: citasHoy },
      { count: citasAyer },
      { count: citasSemana },
      { data: citasHoyRows },
      { data: pacientesMesRows },
      { data: pacientesMesAnteriorRows },
      { data: clinicaRow },
    ] = await Promise.all([
      client
        .from("citas")
        .select("id", { count: "exact", head: true })
        .eq("clinica_id", clinicaId)
        .gte("fecha", inicioHoy.toISOString())
        .lt("fecha", finHoy.toISOString()),
      client
        .from("citas")
        .select("id", { count: "exact", head: true })
        .eq("clinica_id", clinicaId)
        .gte("fecha", inicioAyer.toISOString())
        .lt("fecha", inicioHoy.toISOString()),
      client
        .from("citas")
        .select("id", { count: "exact", head: true })
        .eq("clinica_id", clinicaId)
        .gte("fecha", inicioSemana.toISOString())
        .lt("fecha", finSemana.toISOString()),
      client
        .from("citas")
        .select("duracion_minutos")
        .eq("clinica_id", clinicaId)
        .neq("estado", "cancelada")
        .gte("fecha", inicioHoy.toISOString())
        .lt("fecha", finHoy.toISOString()),
      client
        .from("citas")
        .select("paciente_nombre")
        .eq("clinica_id", clinicaId)
        .neq("estado", "cancelada")
        .gte("fecha", inicioMes.toISOString())
        .lt("fecha", finMes.toISOString()),
      client
        .from("citas")
        .select("paciente_nombre")
        .eq("clinica_id", clinicaId)
        .neq("estado", "cancelada")
        .gte("fecha", inicioMesAnterior.toISOString())
        .lt("fecha", inicioMes.toISOString()),
      client.from("clinicas").select("horario").eq("id", clinicaId).maybeSingle(),
    ])

    const pacientesActivos = new Set(
      (pacientesMesRows ?? []).map((r: { paciente_nombre: string }) => r.paciente_nombre)
    ).size
    const pacientesMesAnterior = new Set(
      (pacientesMesAnteriorRows ?? []).map((r: { paciente_nombre: string }) => r.paciente_nombre)
    ).size

    // Ocupacion real: minutos reservados hoy / minutos disponibles segun el horario de la clinica.
    const horario = (clinicaRow?.horario ?? {}) as HorarioSemana
    const diaHoy = DIAS_SEMANA[hoy.getUTCDay()]
    const horarioHoy = horario[diaHoy]
    const minutosDisponibles = horarioHoy
      ? minutosDesdeHora(horarioHoy.cierra) - minutosDesdeHora(horarioHoy.abre)
      : 0
    const minutosReservados = (citasHoyRows ?? []).reduce(
      (acc: number, r: { duracion_minutos: number }) => acc + (r.duracion_minutos ?? 0),
      0
    )
    const tasaOcupacion = minutosDisponibles > 0 ? Math.round((minutosReservados / minutosDisponibles) * 100) : null

    const stats: DashboardStats = {
      citasHoy: citasHoy ?? 0,
      citasHoyTrend: cambioPorcentual(citasHoy ?? 0, citasAyer ?? 0),
      pacientesActivos,
      pacientesActivosTrend: cambioPorcentual(pacientesActivos, pacientesMesAnterior),
      // Sin sistema de pagos ni mensajeria todavia: no hay fuente de datos real para estos dos.
      ingresosMes: 0,
      mensajesNuevos: 0,
      citasSemana: citasSemana ?? 0,
      tasaOcupacion,
    }

    const response: ApiResponse<DashboardStats> = { data: stats, success: true }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { data: null, success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
