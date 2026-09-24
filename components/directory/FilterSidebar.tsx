"use client"

import { SlidersHorizontal, X } from "lucide-react"
import type { Aseguradora, Especialidad, FiltrosDirectorio, Idioma } from "@/types"
import { ASEGURADORA_LABELS, ESPECIALIDAD_LABELS, IDIOMA_LABELS, cn } from "@/lib/utils"

interface FilterSidebarProps {
  filtros: FiltrosDirectorio
  onFiltrosChange: (filtros: FiltrosDirectorio) => void
  totalResultados: number
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function CheckItem({
  label,
  checked,
  onChange,
  badge,
}: {
  label: string
  checked: boolean
  onChange: () => void
  badge?: string
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={onChange}
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer",
          checked
            ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
            : "border-slate-300 group-hover:border-[var(--color-primary)]"
        )}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span
        onClick={onChange}
        className={cn(
          "text-sm transition-colors leading-none",
          checked ? "text-slate-900 font-medium" : "text-slate-600 group-hover:text-slate-900"
        )}
      >
        {label}
      </span>
      {badge && (
        <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </label>
  )
}

const IDIOMAS: Idioma[] = ["es", "en"]
const ESPECIALIDADES: Especialidad[] = [
  "ortodoncia", "implantes", "estetica", "endodoncia",
  "cirugia", "pediatrica", "periodoncia", "general",
]
const ASEGURADORAS: Aseguradora[] = [
  "blue_cross", "aetna", "cigna", "humana",
  "united_health", "medicare", "medicaid", "metlife",
]

export function FilterSidebar({ filtros, onFiltrosChange, totalResultados }: FilterSidebarProps) {
  function toggleIdioma(idioma: Idioma) {
    const current = filtros.idiomas
    const updated = current.includes(idioma)
      ? current.filter((i) => i !== idioma)
      : [...current, idioma]
    onFiltrosChange({ ...filtros, idiomas: updated })
  }

  function toggleEspecialidad(esp: Especialidad) {
    const current = filtros.especialidades
    const updated = current.includes(esp)
      ? current.filter((e) => e !== esp)
      : [...current, esp]
    onFiltrosChange({ ...filtros, especialidades: updated })
  }

  function toggleAseguradora(aseg: Aseguradora) {
    const current = filtros.aseguradoras
    const updated = current.includes(aseg)
      ? current.filter((a) => a !== aseg)
      : [...current, aseg]
    onFiltrosChange({ ...filtros, aseguradoras: updated })
  }

  const hasActiveFilters =
    filtros.idiomas.length > 0 ||
    filtros.especialidades.length > 0 ||
    filtros.aseguradoras.length > 0 ||
    filtros.soloVerificadas ||
    filtros.ratingMinimo > 0

  function clearAll() {
    onFiltrosChange({
      busqueda: filtros.busqueda,
      idiomas: [],
      especialidades: [],
      aseguradoras: [],
      soloVerificadas: false,
      ratingMinimo: 0,
    })
  }

  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="font-semibold text-slate-800">Filtros</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{totalResultados} resultados</span>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
              >
                <X className="h-3 w-3" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Verificadas toggle */}
        <FilterGroup title="Estado">
          <CheckItem
            label="Solo clinicas verificadas"
            checked={filtros.soloVerificadas}
            onChange={() => onFiltrosChange({ ...filtros, soloVerificadas: !filtros.soloVerificadas })}
          />
        </FilterGroup>

        {/* Rating */}
        <FilterGroup title="Calificacion minima">
          <div className="flex gap-2">
            {[0, 4, 4.5, 4.8].map((r) => (
              <button
                key={r}
                onClick={() => onFiltrosChange({ ...filtros, ratingMinimo: r })}
                className={cn(
                  "flex-1 text-xs py-1.5 rounded-lg border transition-all",
                  filtros.ratingMinimo === r
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white font-medium"
                    : "border-slate-200 text-slate-600 hover:border-[var(--color-primary)]"
                )}
              >
                {r === 0 ? "Todas" : `${r}+`}
              </button>
            ))}
          </div>
        </FilterGroup>

        {/* Idiomas */}
        <FilterGroup title="Idioma de atencion">
          {IDIOMAS.map((idioma) => (
            <CheckItem
              key={idioma}
              label={IDIOMA_LABELS[idioma]}
              checked={filtros.idiomas.includes(idioma)}
              onChange={() => toggleIdioma(idioma)}
            />
          ))}
        </FilterGroup>

        {/* Especialidades */}
        <FilterGroup title="Especialidades">
          {ESPECIALIDADES.map((esp) => (
            <CheckItem
              key={esp}
              label={ESPECIALIDAD_LABELS[esp]}
              checked={filtros.especialidades.includes(esp)}
              onChange={() => toggleEspecialidad(esp)}
            />
          ))}
        </FilterGroup>

        {/* Aseguradoras */}
        <FilterGroup title="Aseguradoras aceptadas">
          {ASEGURADORAS.map((aseg) => (
            <CheckItem
              key={aseg}
              label={ASEGURADORA_LABELS[aseg]}
              checked={filtros.aseguradoras.includes(aseg)}
              onChange={() => toggleAseguradora(aseg)}
            />
          ))}
        </FilterGroup>
      </div>
    </aside>
  )
}
