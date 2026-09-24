import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  createCita,
  diaRange,
  findDoctorById,
  fromCitaRow,
  listDoctoresByClinica,
  mesRange,
  updateCita,
} from "@/lib/clinicas/store"
import type { ApiResponse, Cita, EstadoCita } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicaId = searchParams.get("clinicaId") ?? "1"
    const fecha = searchParams.get("fecha") // "YYYY-MM-DD" para un dia
    const mes = searchParams.get("mes") // "YYYY-MM" para el mes entero
    const doctorId = searchParams.get("doctorId")
    const estado = searchParams.get("estado") as EstadoCita | null

    let query = supabaseAdmin().from("citas").select("*").eq("clinica_id", clinicaId)
    if (fecha) {
      const [inicio, fin] = diaRange(fecha)
      query = query.gte("fecha", inicio).lt("fecha", fin)
    }
    if (mes) {
      const [inicio, fin] = mesRange(mes)
      query = query.gte("fecha", inicio).lt("fecha", fin)
    }
    if (doctorId) query = query.eq("doctor_id", doctorId)
    if (estado) query = query.eq("estado", estado)

    const { data, error } = await query.order("fecha", { ascending: true })
    if (error) throw error
    const citas = (data as Parameters<typeof fromCitaRow>[0][]).map(fromCitaRow)
    const doctores = await listDoctoresByClinica(clinicaId)

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
    const body = await request.json()
    const clinicaId = body.clinicaId ?? "1"
    const doctor = await findDoctorById(body.doctorId)
    const nuevaCita = await createCita({
      clinicaId,
      doctorId: body.doctorId,
      doctorNombre: doctor?.nombre ?? "Doctor",
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
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ data: null, success: false, message: "ID requerido" }, { status: 400 })

    let doctorNombre: string | undefined
    if (updates.doctorId) {
      const doctor = await findDoctorById(updates.doctorId)
      doctorNombre = doctor?.nombre ?? "Doctor"
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ data: null, success: false, message: "ID requerido" }, { status: 400 })

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
