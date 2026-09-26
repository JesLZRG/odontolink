import { NextRequest, NextResponse } from "next/server"
import { fail, validationFail } from "@/lib/auth/flows"
import { hashPassword } from "@/lib/auth/password"
import { crearDoctorSchema } from "@/lib/auth/schemas"
import { getCurrentUser } from "@/lib/auth/session"
import { createUser, findUserByEmail, normalizeEmail, toPublic } from "@/lib/auth/store"
import { createDoctor, listEquipoByClinica, type MiembroEquipo } from "@/lib/clinicas/store"
import type { ApiResponse } from "@/types"

// Los doctores no se registran publicamente: los crea la cuenta de la
// clinica desde su propio panel (/dashboard/equipo).

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.rol !== "clinica" || !user.clinicaId) {
    return fail("No autorizado", 403)
  }

  try {
    const equipo = await listEquipoByClinica(user.clinicaId)
    const response: ApiResponse<MiembroEquipo[]> = { data: equipo, success: true }
    return NextResponse.json(response)
  } catch (error) {
    console.error("GET equipo error:", error)
    return fail("Error interno del servidor", 500)
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.rol !== "clinica" || !user.clinicaId) {
    return fail("No autorizado", 403)
  }

  try {
    const parsed = crearDoctorSchema.safeParse(await request.json())
    if (!parsed.success) return validationFail(parsed.error)
    const { nombre, email, password, especialidad } = parsed.data

    if (await findUserByEmail(email)) {
      return fail("Ya existe una cuenta con este correo", 409)
    }

    const doctor = await createDoctor({ clinicaId: user.clinicaId, nombre, especialidad })
    const cuenta = await createUser({
      email: normalizeEmail(email),
      nombre,
      rol: "doctor",
      passwordHash: await hashPassword(password),
      clinicaId: user.clinicaId,
      doctorId: doctor.id,
    })
    if (!cuenta) {
      return fail("Ya existe una cuenta con este correo", 409)
    }

    return NextResponse.json(
      { success: true, data: { doctor, usuario: toPublic(cuenta) } },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST equipo error:", error)
    return fail("Error interno del servidor", 500)
  }
}
