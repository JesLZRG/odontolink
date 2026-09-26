import { NextResponse } from "next/server"
import { fail } from "@/lib/auth/flows"
import { getCurrentUser } from "@/lib/auth/session"
import { listClinicasPendientes } from "@/lib/clinicas/store"
import type { ApiResponse, Clinica } from "@/types"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.rol !== "admin") return fail("No autorizado", 403)

  try {
    const pendientes = await listClinicasPendientes()
    const response: ApiResponse<Clinica[]> = { data: pendientes, success: true }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Admin clinicas pendientes error:", error)
    return fail("Error interno del servidor", 500)
  }
}
