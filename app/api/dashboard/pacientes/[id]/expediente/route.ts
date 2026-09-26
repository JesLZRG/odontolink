import { NextRequest, NextResponse } from "next/server"
import { fail, validationFail } from "@/lib/auth/flows"
import { getCurrentUser } from "@/lib/auth/session"
import { actualizarExpediente, getExpediente } from "@/lib/clinicas/expedientes"
import { findPacienteByClinica } from "@/lib/clinicas/pacientes"
import { z } from "zod"

const actualizarSchema = z.object({
  notas: z.string().max(20000),
})

// Un doctor solo puede ver/editar el expediente de un paciente con quien
// tiene al menos una cita asignada en su clinica (mismo filtro que la ficha
// de paciente). La clinica (rol "clinica") puede ver/editar cualquiera de
// los suyos.
async function verificarAcceso(pacienteId: string) {
  const user = await getCurrentUser()
  if (!user || !user.clinicaId || (user.rol !== "clinica" && user.rol !== "doctor")) {
    return { user: null as null, error: fail("No autorizado", 403) }
  }
  const doctorId = user.rol === "doctor" ? user.doctorId : undefined
  const paciente = await findPacienteByClinica(user.clinicaId, pacienteId, doctorId)
  if (!paciente) {
    return { user: null as null, error: fail("Paciente no encontrado", 404) }
  }
  return { user, error: null as null }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error } = await verificarAcceso(id)
    if (error) return error

    const expediente = await getExpediente(user.clinicaId!, id)
    return NextResponse.json({ success: true, data: expediente })
  } catch (error) {
    console.error("GET expediente error:", error)
    return fail("Error interno del servidor", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error } = await verificarAcceso(id)
    if (error) return error

    const parsed = actualizarSchema.safeParse(await request.json())
    if (!parsed.success) return validationFail(parsed.error)

    const expediente = await actualizarExpediente(user.clinicaId!, id, {
      notas: parsed.data.notas,
      doctorId: user.rol === "doctor" ? user.doctorId : undefined,
      doctorNombre: user.nombre,
    })
    return NextResponse.json({ success: true, data: expediente })
  } catch (error) {
    console.error("PUT expediente error:", error)
    return fail("Error interno del servidor", 500)
  }
}
