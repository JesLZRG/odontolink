import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { diaRange, fromCitaRow } from "@/lib/clinicas/store"
import { getCurrentUser } from "@/lib/auth/session"
import type { ApiResponse, Cita } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ data: [], success: false, message: "No autenticado" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    // Cada clinica solo ve sus propias citas
    const clinicaId = user.clinicaId
    const fecha = searchParams.get("fecha")

    let query = supabaseAdmin().from("citas").select("*").eq("clinica_id", clinicaId ?? "")
    if (fecha) {
      const [inicio, fin] = diaRange(fecha)
      query = query.gte("fecha", inicio).lt("fecha", fin)
    }
    const { data, error } = await query.order("fecha", { ascending: true })
    if (error) throw error
    const citas = (data as Parameters<typeof fromCitaRow>[0][]).map(fromCitaRow)

    const response: ApiResponse<Cita[]> = {
      data: citas,
      success: true,
      meta: { total: citas.length, pagina: 1, porPagina: 50 },
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching citas:", error)
    return NextResponse.json(
      { data: [], success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
