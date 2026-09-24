import { NextRequest, NextResponse } from "next/server"
import { CITAS_MOCK } from "@/lib/mock-data"
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
    let citas = CITAS_MOCK.filter((c) => c.clinicaId === clinicaId)
    if (fecha) citas = citas.filter((c) => c.fecha.startsWith(fecha))
    citas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
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
