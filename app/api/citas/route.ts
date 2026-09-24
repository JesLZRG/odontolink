import { NextRequest, NextResponse } from "next/server"
import { fail, validationFail } from "@/lib/auth/flows"
import { rateLimit } from "@/lib/auth/rate-limit"
import { getCurrentUser } from "@/lib/auth/session"
import { agendarCitaSchema } from "@/lib/clinicas/schemas"
import { createCita, findDoctorById, listCitasOcupadasDoctorDia } from "@/lib/clinicas/store"
import type { ApiResponse, Cita } from "@/types"

// Endpoint publico: consultar horarios ocupados de un doctor en un dia
// (para pintar la grilla de horas disponibles en la pagina de la clinica)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")
    const fecha = searchParams.get("fecha")
    if (!doctorId || !fecha) {
      return fail("doctorId y fecha son requeridos", 400)
    }
    const ocupadas = await listCitasOcupadasDoctorDia(doctorId, fecha)
    return NextResponse.json({ success: true, data: ocupadas })
  } catch (error) {
    console.error("GET disponibilidad error:", error)
    return fail("Error interno del servidor", 500)
  }
}

// Endpoint publico: agendar una cita desde la pagina de una clinica.
// No requiere sesion; si el visitante esta autenticado como paciente,
// la cita queda ligada a su cuenta.
export async function POST(request: NextRequest) {
  try {
    const parsed = agendarCitaSchema.safeParse(await request.json())
    if (!parsed.success) return validationFail(parsed.error)
    const body = parsed.data

    if (!rateLimit(`agendar:${body.pacienteEmail.toLowerCase()}`, 5, 15 * 60_000)) {
      return fail("Demasiados intentos. Espera unos minutos e intenta de nuevo.", 429)
    }

    const doctor = await findDoctorById(body.doctorId)
    if (!doctor || doctor.clinicaId !== body.clinicaId) {
      return fail("El doctor seleccionado no pertenece a esta clinica", 400)
    }

    // body.fecha llega sin zona horaria (ej. "2026-09-25T09:00:00"). Postgres la
    // interpreta como UTC al guardarla, asi que forzamos "Z" aqui tambien: si no,
    // new Date() la parsearia con la zona horaria LOCAL del servidor y el calculo
    // de conflictos de horario quedaria desalineado con lo que hay en la base.
    const fecha = new Date(`${body.fecha}Z`)
    if (Number.isNaN(fecha.getTime()) || fecha.getTime() < Date.now() - 60_000) {
      return fail("Selecciona una fecha y hora validas", 400)
    }

    const DURACION_MINUTOS = 45
    const fechaDia = body.fecha.slice(0, 10)
    const ocupadas = await listCitasOcupadasDoctorDia(body.doctorId, fechaDia)
    const nuevoInicio = fecha.getTime()
    const nuevoFin = nuevoInicio + DURACION_MINUTOS * 60_000
    const hayConflicto = ocupadas.some((c) => {
      const inicio = new Date(c.fecha).getTime()
      const fin = inicio + c.duracionMinutos * 60_000
      return nuevoInicio < fin && inicio < nuevoFin
    })
    if (hayConflicto) {
      return fail("Ese horario ya no esta disponible. Elige otro.", 409)
    }

    const user = await getCurrentUser()
    const esPaciente = user?.rol === "paciente"

    const nuevaCita = await createCita({
      clinicaId: body.clinicaId,
      doctorId: body.doctorId,
      doctorNombre: doctor.nombre,
      pacienteId: esPaciente ? user!.id : undefined,
      pacienteNombre: esPaciente ? user!.nombre : body.pacienteNombre,
      pacienteEmail: esPaciente ? user!.email : body.pacienteEmail,
      pacienteAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(esPaciente ? user!.nombre : body.pacienteNombre)}&background=0891B2&color=fff`,
      fecha: body.fecha,
      duracionMinutos: DURACION_MINUTOS,
      tratamiento: body.tratamiento,
      notas: body.notas,
      esTurismo: body.esTurismo,
    })

    const response: ApiResponse<Cita> = { data: nuevaCita, success: true, message: "Cita agendada exitosamente" }
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("POST agendar cita error:", error)
    return fail("Error al agendar la cita", 500)
  }
}
