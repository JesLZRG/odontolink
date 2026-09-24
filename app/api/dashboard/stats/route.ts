import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUser } from "@/lib/auth/session"
import type { ApiResponse, DashboardStats } from "@/types"

function inicioDeSemana(base: Date): Date {
  const dia = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()))
  const offset = (dia.getUTCDay() + 6) % 7 // lunes = 0
  dia.setUTCDate(dia.getUTCDate() - offset)
  return dia
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

    const inicioSemana = inicioDeSemana(hoy)
    const finSemana = new Date(inicioSemana)
    finSemana.setUTCDate(finSemana.getUTCDate() + 7)

    const [{ count: citasHoy }, { count: citasSemana }, { data: pacientesRows }] = await Promise.all([
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
        .gte("fecha", inicioSemana.toISOString())
        .lt("fecha", finSemana.toISOString()),
      client
        .from("citas")
        .select("paciente_nombre")
        .eq("clinica_id", clinicaId)
        .neq("estado", "cancelada"),
    ])

    const pacientesActivos = new Set((pacientesRows ?? []).map((r: { paciente_nombre: string }) => r.paciente_nombre)).size

    // Sin sistema de pagos/mensajeria todavia: estos tres no tienen fuente de datos real.
    const stats: DashboardStats = {
      citasHoy: citasHoy ?? 0,
      pacientesActivos,
      ingresosMes: 0,
      mensajesNuevos: 0,
      citasSemana: citasSemana ?? 0,
      tasaOcupacion: 0,
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
