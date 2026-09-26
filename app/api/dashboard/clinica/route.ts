import { NextResponse } from "next/server"
import { fail } from "@/lib/auth/flows"
import { getCurrentUser } from "@/lib/auth/session"
import { findClinicaByIdOrSlug } from "@/lib/clinicas/store"
import type { ApiResponse, Clinica } from "@/types"

// A diferencia de /api/clinicas/[id] (publico, solo muestra aprobadas), este
// endpoint deja que la propia clinica vea su estado sin importar si esta
// pendiente, aprobada o rechazada.
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.rol !== "clinica" || !user.clinicaId) {
    return fail("No autorizado", 403)
  }

  try {
    const clinica = await findClinicaByIdOrSlug(user.clinicaId)
    if (!clinica) return fail("Clinica no encontrada", 404)
    const response: ApiResponse<Clinica> = { data: clinica, success: true }
    return NextResponse.json(response)
  } catch (error) {
    console.error("GET dashboard clinica error:", error)
    return fail("Error interno del servidor", 500)
  }
}
