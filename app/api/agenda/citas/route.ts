import { NextRequest, NextResponse } from "next/server"
import { CITAS_MOCK, DOCTORES_MOCK } from "@/lib/mock-data"
import type { ApiResponse, Cita, EstadoCita, Especialidad } from "@/types"

// Almacenamiento en memoria (en produccion seria la BD)
let citasStore: Cita[] = [...CITAS_MOCK]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicaId = searchParams.get("clinicaId") ?? "1"
    const fecha = searchParams.get("fecha")           // "YYYY-MM-DD" para un dia
    const mes = searchParams.get("mes")               // "YYYY-MM" para el mes entero
    const doctorId = searchParams.get("doctorId")
    const estado = searchParams.get("estado") as EstadoCita | null

    let citas = citasStore.filter((c) => c.clinicaId === clinicaId)

    if (fecha) citas = citas.filter((c) => c.fecha.startsWith(fecha))
    if (mes) citas = citas.filter((c) => c.fecha.startsWith(mes))
    if (doctorId) citas = citas.filter((c) => c.doctorId === doctorId)
    if (estado) citas = citas.filter((c) => c.estado === estado)

    citas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    const response: ApiResponse<{ citas: Cita[]; doctores: typeof DOCTORES_MOCK }> = {
      data: { citas, doctores: DOCTORES_MOCK },
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
    const newCita: Cita = {
      id: `c${Date.now()}`,
      pacienteId: `p${Date.now()}`,
      clinicaId: body.clinicaId ?? "1",
      pacienteNombre: body.pacienteNombre,
      pacienteAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(body.pacienteNombre)}&background=0891B2&color=fff`,
      doctorId: body.doctorId,
      doctorNombre: DOCTORES_MOCK.find((d) => d.id === body.doctorId)?.nombre ?? "Doctor",
      fecha: body.fecha,
      duracionMinutos: Number(body.duracionMinutos) || 60,
      tratamiento: body.tratamiento as Especialidad,
      estado: "programada",
      notas: body.notas ?? "",
      esTurismo: body.esTurismo ?? false,
    }
    citasStore.push(newCita)
    // Sync back to mock for dashboard consistency
    CITAS_MOCK.push(newCita)
    return NextResponse.json({ data: newCita, success: true, message: "Cita creada exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("POST agenda error:", error)
    return NextResponse.json({ data: null, success: false, message: "Error al crear cita" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const idx = citasStore.findIndex((c) => c.id === id)
    if (idx === -1) return NextResponse.json({ data: null, success: false, message: "Cita no encontrada" }, { status: 404 })
    citasStore[idx] = { ...citasStore[idx], ...updates }
    return NextResponse.json({ data: citasStore[idx], success: true, message: "Cita actualizada" })
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
    const idx = citasStore.findIndex((c) => c.id === id)
    if (idx === -1) return NextResponse.json({ data: null, success: false, message: "Cita no encontrada" }, { status: 404 })
    // Cancelar en lugar de borrar
    citasStore[idx] = { ...citasStore[idx], estado: "cancelada" }
    return NextResponse.json({ data: citasStore[idx], success: true, message: "Cita cancelada" })
  } catch (error) {
    console.error("DELETE agenda error:", error)
    return NextResponse.json({ data: null, success: false, message: "Error al cancelar" }, { status: 500 })
  }
}