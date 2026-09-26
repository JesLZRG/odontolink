import { NextRequest, NextResponse } from "next/server"
import { fail } from "@/lib/auth/flows"
import { getCurrentUser } from "@/lib/auth/session"
import { updateClinicaEstadoAprobacion } from "@/lib/clinicas/store"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== "admin") return fail("No autorizado", 403)

  try {
    const { id } = await params
    const body = await request.json()
    if (body.estadoAprobacion !== "aprobada" && body.estadoAprobacion !== "rechazada") {
      return fail("estadoAprobacion invalido", 400)
    }

    const clinica = await updateClinicaEstadoAprobacion(id, body.estadoAprobacion)
    if (!clinica) return fail("Clinica no encontrada", 404)

    return NextResponse.json({ success: true, data: clinica })
  } catch (error) {
    console.error("PATCH admin clinica error:", error)
    return fail("Error interno del servidor", 500)
  }
}
