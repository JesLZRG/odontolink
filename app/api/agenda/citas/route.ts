import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUser } from "@/lib/auth/session"
import {
  createCita,
  diaRange,
  findCitaById,
  findDoctorById,
  fromCitaRow,
  listDoctoresByClinica,
  mesRange,
  updateCita,
} from "@/lib/clinicas/store"
import type { ApiResponse, Cita, EstadoCita } from "@/types"

type SessionUser = Awaited<ReturnType<typeof getCurrentUser>>

// La clinica ve toda su agenda; un doctor solo ve/edita sus propias citas
// dentro de esa clinica. clinicaId y doctorId nunca vienen del cliente: se
// derivan siempre de la sesion.
async function sesionAgenda(): Promise<
  { user: NonNullable<SessionUser>; clinicaId: string; doctorId?: string } | null
> {
  const user = await getCurrentUser()
  if (!user || !user.clinicaId || (user.rol !== "clinica" && user.rol !== "doctor")) return null
  return { user, clinicaId: user.clinicaId, doctorId: user.rol === "doctor" ? user.doctorId : undefined }
}

export async function GET(request: NextRequest) {
  try {
    const sesion = await sesionAgenda()
    if (!sesion) return NextResponse.json({ data: null, success: false, message: "No autenticado" }, { status: 401 })
    const { clinicaId, doctorId } = sesion

    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get("fecha") // "YYYY-MM-DD" para un dia
    const mes = searchParams.get("mes") // "YYYY-MM" para el mes entero
    const estado = searchParams.get("estado") as EstadoCita | null

    let query = supabaseAdmin().from("citas").select("*").eq("clinica_id", clinicaId)
    if (doctorId) query = query.eq("doctor_id", doctorId)
    if (fecha) {
      const [inicio, fin] = diaRange(fecha)
      query = query.gte("fecha", inicio).lt("fecha", fin)
    }
    if (mes) {
      const [inicio, fin] = mesRange(mes)
      query = query.gte("fecha", inicio).lt("fecha", fin)
    }
    if (estado) query = query.eq("estado", estado)

    const { data, error } = await query.order("fecha", { ascending: true })
    if (error) throw error
    const citas = (data as Parameters<typeof fromCitaRow>[0][]).map(fromCitaRow)
    const todosLosDoctores = await listDoctoresByClinica(clinicaId)
    // Un doctor solo necesita verse a si mismo en el selector (nunca al resto del equipo).
    const doctores = doctorId ? todosLosDoctores.filter((d) => d.id === doctorId) : todosLosDoctores

    const response: ApiResponse<{ citas: Cita[]; doctores: typeof doctores }> = {
      data: { citas, doctores },
      success: true,
      meta: { total: citas.length, pagina: 1, porPagina: 100 },
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("GET agenda error:", error)
    return NextResponse.json({ data: null, success: false, message: "Error interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sesion = await sesionAgenda()
    if (!sesion) return NextResponse.json({ data: null, success: false, message: "No autenticado" }, { status: 401 })
    const { clinicaId, doctorId } = sesion

    const body = await request.json()
    // Si quien crea la cita es un doctor, la cita siempre queda asignada a
    // si mismo, sin importar que doctorId venga en el body.
    const doctorIdFinal = doctorId ?? body.doctorId
    const doctor = await findDoctorById(doctorIdFinal)
    if (!doctor || doctor.clinicaId !== clinicaId) {
      return NextResponse.json({ data: null, success: false, message: "Doctor invalido" }, { status: 400 })
    }

    const nuevaCita = await createCita({
      clinicaId,
      doctorId: doctorIdFinal,
      doctorNombre: doctor.nombre,
      pacienteNombre: body.pacienteNombre,
      pacienteAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(body.pacienteNombre)}&background=0891B2&color=fff`,
      fecha: body.fecha,
      duracionMinutos: Number(body.duracionMinutos) || 60,
      tratamiento: body.tratamiento,
      notas: body.notas ?? "",
      esTurismo: body.esTurismo ?? false,
    })
    return NextResponse.json({ data: nuevaCita, success: true, message: "Cita creada exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("POST agenda error:", error)
    return NextResponse.json({ data: null, success: false, message: "Error al crear cita" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sesion = await sesionAgenda()
    if (!sesion) return NextResponse.json({ data: null, success: false, message: "No autenticado" }, { status: 401 })
    const { clinicaId, doctorId } = sesion

    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ data: null, success: false, message: "ID requerido" }, { status: 400 })

    const existente = await findCitaById(id)
    if (!existente || existente.clinicaId !== clinicaId || (doctorId && existente.doctorId !== doctorId)) {
      return NextResponse.json({ data: null, success: false, message: "Cita no encontrada" }, { status: 404 })
    }

    // Un doctor no puede reasignar su cita a otro doctor.
    if (doctorId && updates.doctorId && updates.doctorId !== doctorId) {
      return NextResponse.json({ data: null, success: false, message: "No puedes reasignar esta cita" }, { status: 403 })
    }

    let doctorNombre: string | undefined
    if (updates.doctorId) {
      const doctor = await findDoctorById(updates.doctorId)
      if (!doctor || doctor.clinicaId !== clinicaId) {
        return NextResponse.json({ data: null, success: false, message: "Doctor invalido" }, { status: 400 })
      }
      doctorNombre = doctor.nombre
    }

    const citaActualizada = await updateCita(id, { ...updates, doctorNombre })
    if (!citaActualizada) {
      return NextResponse.json({ data: null, success: false, message: "Cita no encontrada" }, { status: 404 })
    }
    return NextResponse.json({ data: citaActualizada, success: true, message: "Cita actualizada" })
  } catch (error) {
    console.error("PATCH agenda error:", error)
    return NextResponse.json({ data: null, success: false, message: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sesion = await sesionAgenda()
    if (!sesion) return NextResponse.json({ data: null, success: false, message: "No autenticado" }, { status: 401 })
    const { clinicaId, doctorId } = sesion

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ data: null, success: false, message: "ID requerido" }, { status: 400 })

    const existente = await findCitaById(id)
    if (!existente || existente.clinicaId !== clinicaId || (doctorId && existente.doctorId !== doctorId)) {
      return NextResponse.json({ data: null, success: false, message: "Cita no encontrada" }, { status: 404 })
    }

    // Cancelar en lugar de borrar
    const cancelada = await updateCita(id, { estado: "cancelada" })
    if (!cancelada) {
      return NextResponse.json({ data: null, success: false, message: "Cita no encontrada" }, { status: 404 })
    }
    return NextResponse.json({ data: cancelada, success: true, message: "Cita cancelada" })
  } catch (error) {
    console.error("DELETE agenda error:", error)
    return NextResponse.json({ data: null, success: false, message: "Error al cancelar" }, { status: 500 })
  }
}
