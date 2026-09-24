import { NextRequest, NextResponse } from "next/server"
import type { UserRole } from "@/types"

interface RegistroBody {
  nombre: string
  email: string
  password: string
  telefono?: string
  ciudad?: string
  rol: UserRole
}

export async function POST(request: NextRequest) {
  try {
    const body: RegistroBody = await request.json()
    const { nombre, email, password, rol } = body
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }
    await new Promise((resolve) => setTimeout(resolve, 800))
    const mockUserId = `u_${Date.now()}`
    return NextResponse.json({
      success: true,
      data: {
        user: { id: mockUserId, nombre, email, rol },
        token: `mock-jwt-token-${mockUserId}`,
        redirectTo: rol === "clinica" ? "/dashboard" : "/directorio",
        message: "Cuenta creada exitosamente! Por favor verifica tu correo.",
      },
    })
  } catch (error) {
    console.error("Registro error:", error)
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}