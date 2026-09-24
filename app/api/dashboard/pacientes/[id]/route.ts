import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { findPacienteByClinica, type PacienteDetalle } from "@/lib/clinicas/pacientes"
import type { ApiResponse } from "@/types"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.clinicaId) {
      return NextResponse.json({ data: null, success: false, message: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const paciente = await findPacienteByClinica(user.clinicaId, id)
    if (!paciente) {
      return NextResponse.json({ data: null, success: false, message: "Paciente no encontrado" }, { status: 404 })
    }

    const response: ApiResponse<PacienteDetalle> = { data: paciente, success: true }
    return NextResponse.json(response)
  } catch (error) {
    console.error("GET paciente detalle error:", error)
    return NextResponse.json({ data: null, success: false, message: "Error interno" }, { status: 500 })
  }
}
