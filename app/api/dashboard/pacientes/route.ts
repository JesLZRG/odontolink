import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { listPacientesByClinica, type PacienteResumen } from "@/lib/clinicas/pacientes"
import type { ApiResponse } from "@/types"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.clinicaId || (user.rol !== "clinica" && user.rol !== "doctor")) {
      return NextResponse.json({ data: [], success: false, message: "No autenticado" }, { status: 401 })
    }

    const doctorId = user.rol === "doctor" ? user.doctorId : undefined
    const pacientes = await listPacientesByClinica(user.clinicaId, doctorId)
    const response: ApiResponse<PacienteResumen[]> = { data: pacientes, success: true }
    return NextResponse.json(response)
  } catch (error) {
    console.error("GET pacientes error:", error)
    return NextResponse.json({ data: [], success: false, message: "Error interno" }, { status: 500 })
  }
}
