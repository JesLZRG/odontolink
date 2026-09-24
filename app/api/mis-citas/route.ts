import { NextResponse } from "next/server"
import { fail } from "@/lib/auth/flows"
import { getCurrentUser } from "@/lib/auth/session"
import { listCitasByPaciente } from "@/lib/clinicas/store"

// Citas del paciente autenticado. Solo devuelve las que estan ligadas a su
// propia cuenta (paciente_id), nunca las de otros pacientes.
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return fail("No autenticado", 401)
  if (user.rol !== "paciente") return fail("Solo disponible para cuentas de paciente", 403)

  try {
    const citas = await listCitasByPaciente(user.id)
    return NextResponse.json({ success: true, data: citas })
  } catch (error) {
    console.error("Mis citas error:", error)
    return fail("Error interno del servidor", 500)
  }
}
