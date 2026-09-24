"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { SearchBar } from "@/components/directory/SearchBar"
import { FilterSidebar } from "@/components/directory/FilterSidebar"
import { ClinicCard } from "@/components/directory/ClinicCard"
import { AccountLink } from "@/components/directory/AccountLink"
import type { Clinica, FiltrosDirectorio } from "@/types"
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react"

const DEFAULT_FILTROS: FiltrosDirectorio = {
  busqueda: "",
  idiomas: [],
  especialidades: [],
  aseguradoras: [],
  soloVerificadas: false,
  ratingMinimo: 0,
}

import Image from "next/image"

// Logo OdontoLink minimal
function Logo() {
  return (
    <Link href="/login" className="flex items-center gap-2.5 group">
      <div className="w-10 h-10 flex items-center justify-center drop-shadow-sm">
        <Image src="/logo.png" alt="OdontoLink" width={40} height={40} className="object-contain" />
      </div>
      <span className="text-lg font-bold gradient-brand-text group-hover:opacity-80 transition-opacity">OdontoLink</span>
    </Link>
  )
}

function EmptyState({ busqueda }: { busqueda: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        Sin resultados
      </h3>
      <p className="text-slate-500 text-sm max-w-sm">
        {busqueda
          ? `No encontramos clinicas para "${busqueda}". Intenta con otro termino o ajusta los filtros.`
          : "No hay clinicas que coincidan con los filtros aplicados."}
      </p>
    </div>
  )
}

export default function DirectorioPage() {
  const [clinicas, setClinicas] = useState<Clinica[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosDirectorio>(DEFAULT_FILTROS)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const fetchClinicas = useCallback(async (f: FiltrosDirectorio) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (f.busqueda) params.set("busqueda", f.busqueda)
      f.idiomas.forEach((i) => params.append("idiomas", i))
      f.especialidades.forEach((e) => params.append("especialidades", e))
      f.aseguradoras.forEach((a) => params.append("aseguradoras", a))
      if (f.soloVerificadas) params.set("soloVerificadas", "true")
      if (f.ratingMinimo > 0) params.set("ratingMinimo", f.ratingMinimo.toString())

      const res = await fetch(`/api/clinicas?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setClinicas(json.data)
        setTotal(json.meta?.total ?? json.data.length)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchClinicas(filtros), 300)
    return () => clearTimeout(timer)
  }, [filtros, fetchClinicas])

  const activeFilterCount =
    filtros.idiomas.length +
    filtros.especialidades.length +
    filtros.aseguradoras.length +
    (filtros.soloVerificadas ? 1 : 0) +
    (filtros.ratingMinimo > 0 ? 1 : 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Logo />
          <div className="flex-1 max-w-2xl">
            <SearchBar
              value={filtros.busqueda}
              onChange={(v) => setFiltros((f) => ({ ...f, busqueda: v }))}
            />
          </div>
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-[var(--color-primary)] transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="ml-0.5 bg-[var(--color-primary)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {/* Auth link */}
          <AccountLink />
        </div>
      </header>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">Filtros</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              filtros={filtros}
              onFiltrosChange={(f) => { setFiltros(f); }}
              totalResultados={total}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Directorio de Clinicas Dentales
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? "Buscando..." : `${total} clinica${total !== 1 ? "s" : ""} encontrada${total !== 1 ? "s" : ""}`}
              {filtros.busqueda && ` para "${filtros.busqueda}"`}
            </p>
          </div>
          {/* Sort (visual, no funcional en MVP) */}
          <select className="hidden sm:block h-9 px-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
            <option>Mas relevantes</option>
            <option>Mejor calificacion</option>
            <option>Mas resenias</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              filtros={filtros}
              onFiltrosChange={setFiltros}
              totalResultados={total}
            />
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 text-[var(--color-primary)] animate-spin mb-3" />
                <p className="text-slate-500 text-sm">Buscando clinicas...</p>
              </div>
            ) : clinicas.length === 0 ? (
              <EmptyState busqueda={filtros.busqueda} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {clinicas.map((clinica, i) => (
                  <ClinicCard
                    key={clinica.id}
                    clinica={clinica}
                    featured={i === 0 && clinica.planSuscripcion === "premium"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
