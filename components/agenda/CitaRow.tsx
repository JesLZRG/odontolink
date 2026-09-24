"use client"

import { Pencil, X, Plane, Clock, User } from "lucide-react"
import type { Cita } from "@/types"
import { ESTADO_CITA_COLORS, ESTADO_CITA_LABELS, ESPECIALIDAD_LABELS, formatTime, getInitials, cn } from "@/lib/utils"

interface CitaRowProps {
  cita: Cita
  onEdit: (cita: Cita) => void
  onCancel: (id: string) => void
}

export function CitaRow({ cita, onEdit, onCancel }: CitaRowProps) {
  const isCancellable = cita.estado !== "cancelada" && cita.estado !== "completada"

  return (
    <div className="group flex items-start gap-3 p-3.5 bg-[var(--color-bg-dark)] rounded-xl border border-[var(--color-border-dark)] hover:border-[var(--color-primary)]/30 transition-all duration-150">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
        {cita.pacienteAvatar
          ? <img src={cita.pacienteAvatar} alt={cita.pacienteNombre} className="w-9 h-9 rounded-full object-cover" />
          : getInitials(cita.pacienteNombre)
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-white text-sm font-medium truncate">{cita.pacienteNombre}</p>
          {cita.esTurismo && (
            <span title="Turismo medico">
              <Plane className="h-3 w-3 text-[var(--color-primary-light)] flex-shrink-0" />
            </span>
          )}
        </div>
        <p className="text-[var(--color-text-subtle)] text-xs truncate">{ESPECIALIDAD_LABELS[cita.tratamiento]}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs">
            <Clock className="h-3 w-3" />
            {formatTime(cita.fecha)} · {cita.duracionMinutos} min
          </div>
          <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs">
            <User className="h-3 w-3" />
            {cita.doctorNombre}
          </div>
        </div>
        {cita.notas && (
          <p className="text-[var(--color-text-subtle)] text-xs mt-1.5 italic line-clamp-1">"{cita.notas}"</p>
        )}
      </div>

      {/* Right side: badge + actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", ESTADO_CITA_COLORS[cita.estado])}>
          {ESTADO_CITA_LABELS[cita.estado]}
        </span>
        {isCancellable && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(cita)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/10 transition-colors"
              title="Editar cita"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => onCancel(cita.id)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Cancelar cita"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}