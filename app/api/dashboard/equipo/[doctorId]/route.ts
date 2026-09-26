import { NextRequest, NextResponse } from "next/server"
import { fail } from "@/lib/auth/flows"
import { getCurrentUser } from "@/lib/auth/session"
import { setDoctorActivo } from "@/lib/clinicas/store"

// Activa/desactiva a un doctor del equipo (y, en cascada, su acceso al panel).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== "clinica" || !user.clinicaId) {
    return fail("No autorizado", 403)
  }

  try {
    const { doctorId } = await params
    const body = await request.json()
    if (typeof body.activo !== "boolean") {
      return fail("El campo 'activo' es requerido", 400)
    }

    const ok = await setDoctorActivo(doctorId, user.clinicaId, body.activo)
    if (!ok) {
      return fail("Doctor no encontrado", 404)
    }

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error("PATCH equipo error:", error)
    return fail("Error interno del servidor", 500)
  }
}
