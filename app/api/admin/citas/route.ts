import { NextResponse } from "next/server"
import { fail } from "@/lib/auth/flows"
import { getCurrentUser } from "@/lib/auth/session"
import { listAllCitasAdmin } from "@/lib/clinicas/store"

// Listado para el panel de administrador. El proxy ya bloquea el acceso a
// quien no tenga rol "admin"; se revalida aqui como segunda capa de defensa.
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.rol !== "admin") return fail("No autorizado", 403)

  try {
    const citas = await listAllCitasAdmin()
    return NextResponse.json({ success: true, data: citas })
  } catch (error) {
    console.error("Admin citas error:", error)
    return fail("Error interno del servidor", 500)
  }
}
