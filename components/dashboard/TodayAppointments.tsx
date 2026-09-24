import Image from "next/image"
import { Clock, Plane } from "lucide-react"
import type { Cita } from "@/types"
import { ESPECIALIDAD_LABELS, ESTADO_CITA_COLORS, ESTADO_CITA_LABELS, formatTime, getInitials, cn } from "@/lib/utils"

interface TodayAppointmentsProps {
  citas: Cita[]
  loading?: boolean
}

function AppointmentRow({ cita }: { cita: Cita }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
          {cita.pacienteAvatar ? (
            <Image
              src={cita.pacienteAvatar}
              alt={cita.pacienteNombre}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            getInitials(cita.pacienteNombre)
          )}
        </div>
        {/* Estado indicator */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--color-surface-dark)]",
          cita.estado === "en_curso" ? "bg-cyan-400" :
          cita.estado === "confirmada" ? "bg-emerald-400" :
          cita.estado === "programada" ? "bg-blue-400" : "bg-slate-500"
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-white text-sm font-medium truncate">{cita.pacienteNombre}</p>
          {cita.esTurismo && (
            <span title="Turismo medico"><Plane className="h-3 w-3 text-[var(--color-primary-light)] flex-shrink-0" /></span>
          )}
          {cita.esDemo && (
            <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex-shrink-0">
              Demo
            </span>
          )}
        </div>
        <p className="text-[var(--color-text-subtle)] text-xs truncate">
          {ESPECIALIDAD_LABELS[cita.tratamiento]} &bull; {cita.doctorNombre}
        </p>
      </div>

      {/* Time & Status */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs">
          <Clock className="h-3 w-3" />
          {formatTime(cita.fecha)}
        </div>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-md border font-medium",
          ESTADO_CITA_COLORS[cita.estado]
        )}>
          {ESTADO_CITA_LABELS[cita.estado]}
        </span>
      </div>
    </div>
  )
}

export function TodayAppointments({ citas, loading }: TodayAppointmentsProps) {
  return (
    <div className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] h-full flex flex-col">
      <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-dark)]">
        <div>
          <h2 className="text-white font-semibold">Citas de Hoy</h2>
          <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">{citas.length} citas programadas</p>
        </div>
        <button className="text-[var(--color-primary-light)] text-xs hover:underline font-medium">
          Ver todas
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[var(--color-border-dark)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[var(--color-border-dark)] rounded w-3/4" />
                  <div className="h-2 bg-[var(--color-border-dark)] rounded w-1/2" />
                </div>
                <div className="w-16 space-y-2">
                  <div className="h-3 bg-[var(--color-border-dark)] rounded" />
                  <div className="h-4 bg-[var(--color-border-dark)] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : citas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-border-dark)] flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-[var(--color-text-subtle)]" />
            </div>
            <p className="text-[var(--color-text-muted)] text-sm">Sin citas para hoy</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {citas.map((cita) => (
              <AppointmentRow key={cita.id} cita={cita} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
