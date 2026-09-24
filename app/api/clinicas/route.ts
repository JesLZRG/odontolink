import { NextRequest, NextResponse } from "next/server"
import { listClinicas } from "@/lib/clinicas/store"
import type { ApiResponse, Clinica, FiltrosDirectorio } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const busqueda = searchParams.get("busqueda") ?? ""
    const idiomas = searchParams.getAll("idiomas") as FiltrosDirectorio["idiomas"]
    const especialidades = searchParams.getAll("especialidades") as FiltrosDirectorio["especialidades"]
    const aseguradoras = searchParams.getAll("aseguradoras") as FiltrosDirectorio["aseguradoras"]
    const soloVerificadas = searchParams.get("soloVerificadas") === "true"
    const ratingMinimo = parseFloat(searchParams.get("ratingMinimo") ?? "0")
    const pagina = parseInt(searchParams.get("pagina") ?? "1")
    const porPagina = parseInt(searchParams.get("porPagina") ?? "12")

    let clinicas = await listClinicas()

    if (busqueda) {
      const query = busqueda.toLowerCase()
      clinicas = clinicas.filter((c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.descripcion.toLowerCase().includes(query) ||
        c.ciudad.toLowerCase().includes(query) ||
        c.especialidades.some((e) => e.toLowerCase().includes(query))
      )
    }
    if (idiomas.length > 0) {
      clinicas = clinicas.filter((c) => idiomas.every((i) => c.idiomas.includes(i)))
    }
    if (especialidades.length > 0) {
      clinicas = clinicas.filter((c) => especialidades.some((e) => c.especialidades.includes(e)))
    }
    if (aseguradoras.length > 0) {
      clinicas = clinicas.filter((c) => aseguradoras.some((a) => c.aseguradoras.includes(a)))
    }
    if (soloVerificadas) clinicas = clinicas.filter((c) => c.verificada)
    if (ratingMinimo > 0) clinicas = clinicas.filter((c) => c.rating >= ratingMinimo)

    const planOrder = { premium: 0, profesional: 1, basico: 2 }
    clinicas.sort((a, b) => {
      const planDiff = planOrder[a.planSuscripcion] - planOrder[b.planSuscripcion]
      return planDiff !== 0 ? planDiff : b.rating - a.rating
    })

    const total = clinicas.length
    const inicio = (pagina - 1) * porPagina
    const paginadas = clinicas.slice(inicio, inicio + porPagina)

    const response: ApiResponse<Clinica[]> = {
      data: paginadas,
      success: true,
      meta: { total, pagina, porPagina },
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching clinicas:", error)
    return NextResponse.json(
      { data: [], success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
