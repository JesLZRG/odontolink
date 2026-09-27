import { NextRequest, NextResponse } from "next/server"
import { fail, validationFail } from "@/lib/auth/flows"
import { hashPassword } from "@/lib/auth/password"
import { activarDoctorSchema } from "@/lib/auth/schemas"
import { getCurrentUser } from "@/lib/auth/session"
import { createUser, findUserByEmail, normalizeEmail, toPublic } from "@/lib/auth/store"
import { findDoctorById } from "@/lib/clinicas/store"

// Da acceso al panel a un perfil de doctor que YA EXISTE en public.doctores
// (por ejemplo, de la semilla original o de citas cargadas antes de que
// existiera el login de doctores). A diferencia de POST /api/dashboard/equipo,
// esto no crea un doctor nuevo: reutiliza el mismo doctorId, asi que las
// citas ya agendadas para el siguen apuntando a la misma persona.
export async function POST(request: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.rol !== "clinica" || !user.clinicaId) {
    return fail("No autorizado", 403)
  }

  try {
    const { doctorId } = await params
    const doctor = await findDoctorById(doctorId)
    if (!doctor || doctor.clinicaId !== user.clinicaId) {
      return fail("Doctor no encontrado", 404)
    }

    const parsed = activarDoctorSchema.safeParse(await request.json())
    if (!parsed.success) return validationFail(parsed.error)
    const { email, password } = parsed.data

    if (await findUserByEmail(email)) {
      return fail("Ya existe una cuenta con este correo", 409)
    }

    const cuenta = await createUser({
      email: normalizeEmail(email),
      nombre: doctor.nombre,
      rol: "doctor",
      passwordHash: await hashPassword(password),
      clinicaId: user.clinicaId,
      doctorId: doctor.id,
    })
    if (!cuenta) {
      return fail("Ya existe una cuenta con este correo", 409)
    }

    return NextResponse.json({ success: true, data: { doctor, usuario: toPublic(cuenta) } }, { status: 201 })
  } catch (error) {
    console.error("POST activar doctor error:", error)
    return fail("Error interno del servidor", 500)
  }
}
