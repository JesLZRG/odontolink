import { NextRequest, NextResponse } from "next/server"
import type { UserRole } from "@/types"

interface LoginBody {
  email: string
  password: string
  rol: UserRole
}

const USERS_MOCK = [
  { id: "u1", email: "paciente@demo.com", password: "Demo1234!", rol: "paciente" as UserRole, nombre: "Ana Torres" },
  { id: "u2", email: "clinica@demo.com", password: "Demo1234!", rol: "clinica" as UserRole, nombre: "Sonrisa Perfecta Dental", clinicaId: "1" },
]

export async function POST(request: NextRequest) {
  try {
    const body: LoginBody = await request.json()
    const { email, password, rol } = body
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user = USERS_MOCK.find((u) => u.email === email && u.password === password && u.rol === rol)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Credenciales incorrectas" },
        { status: 401 }
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = user
    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: `mock-jwt-token-${user.id}-${Date.now()}`,
        redirectTo: rol === "clinica" ? "/dashboard" : "/directorio",
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}