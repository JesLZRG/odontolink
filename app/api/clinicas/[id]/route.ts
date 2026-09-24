import { NextRequest, NextResponse } from "next/server"
import { findClinicaByIdOrSlug } from "@/lib/clinicas/store"
import type { ApiResponse, Clinica } from "@/types"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clinica = await findClinicaByIdOrSlug(id)
    if (!clinica) {
      return NextResponse.json(
        { data: null, success: false, message: "Clinica no encontrada" },
        { status: 404 }
      )
    }
    const response: ApiResponse<Clinica> = { data: clinica, success: true }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching clinica:", error)
    return NextResponse.json(
      { data: null, success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
