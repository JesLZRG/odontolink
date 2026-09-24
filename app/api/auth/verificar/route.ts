import { NextRequest, NextResponse } from "next/server"
import { consumeToken, updateUser } from "@/lib/auth/store"

// Destino del enlace enviado por correo: confirma la direccion y regresa al login
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const userId = token ? await consumeToken(token, "verificar_email") : null
  const destino = new URL("/login", request.nextUrl.origin)

  if (userId && (await updateUser(userId, { emailVerificado: true }))) {
    destino.searchParams.set("verificado", "1")
  } else {
    destino.searchParams.set("error", "enlace_invalido")
  }
  return NextResponse.redirect(destino)
}
