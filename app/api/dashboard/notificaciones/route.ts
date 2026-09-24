import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUser } from "@/lib/auth/session"
import { fromCitaRow } from "@/lib/clinicas/store"
import type { ApiResponse, Cita } from "@/types"

const LIMITE = 8

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.clinicaId) {
      return NextResponse.json({ data: [], success: false, message: "No autenticado" }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin()
      .from("citas")
      .select("*")
      .eq("clinica_id", user.clinicaId)
      .order("creado_en", { ascending: false })
      .limit(LIMITE)
    if (error) throw error

    const citas = (data as Parameters<typeof fromCitaRow>[0][]).map(fromCitaRow)
    const response: ApiResponse<Cita[]> = { data: citas, success: true }
    return NextResponse.json(response)
  } catch (error) {
    console.error("GET notificaciones error:", error)
    return NextResponse.json({ data: [], success: false, message: "Error interno" }, { status: 500 })
  }
}
