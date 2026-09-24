"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Cita, EstadoCita } from "@/types"
import { cn } from "@/lib/utils"

interface AgendaCalendarProps {
  citas: Cita[]
  selectedDate: Date
  currentMonth: number
  currentYear: number
  onSelectDate: (day: number) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onGoToToday: () => void
}

const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

const ESTADO_DOT: Record<EstadoCita, string> = {
  confirmada: "bg-emerald-400",
  programada: "bg-blue-400",
  en_curso: "bg-cyan-400",
  completada: "bg-slate-400",
  cancelada: "bg-red-400",
  no_asistio: "bg-orange-400",
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function AgendaCalendar({
  citas, selectedDate, currentMonth, currentYear,
  onSelectDate, onPrevMonth, onNextMonth, onGoToToday,
}: AgendaCalendarProps) {
  const today = new Date()
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const citasByDay = useMemo(() => {
    const map: Record<number, Cita[]> = {}
    citas.forEach((cita) => {
      const d = new Date(cita.fecha)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate()
        if (!map[day]) map[day] = []
        map[day].push(cita)
      }
    })
    return map
  }, [citas, currentMonth, currentYear])

  const selectedDay = selectedDate.getDate()
  const isSelectedMonth = selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear

  return (
    <div className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-dark)]">
        <div>
          <h2 className="text-white font-semibold">{MONTHS[currentMonth]} {currentYear}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onPrevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={onGoToToday} className="px-3 h-8 text-xs rounded-lg border border-[var(--color-primary)]/40 text-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/10 transition-colors font-medium">
            Hoy
          </button>
          <button onClick={onNextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS_SHORT.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-[var(--color-text-subtle)] py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
            const isSelected = isSelectedMonth && day === selectedDay
            const dayCitas = citasByDay[day] ?? []
            const hasCitas = dayCitas.length > 0
            // Agrupar colores unicos de estados para los dots
            const uniqueEstados = [...new Set(dayCitas.map((c) => c.estado))] as EstadoCita[]

            return (
              <button
                key={day}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl transition-all duration-150 min-h-[52px]",
                  isSelected
                    ? "bg-[var(--color-primary)] text-white shadow-lg"
                    : isToday
                    ? "border border-[var(--color-primary)]/50 text-[var(--color-primary-light)]"
                    : "text-[var(--color-text-muted)] hover:bg-white/8 hover:text-white"
                )}
              >
                <span className="text-xs font-semibold">{day}</span>
                {hasCitas && (
                  <div className="flex flex-wrap justify-center gap-0.5 mt-1 px-1">
                    {uniqueEstados.slice(0, 3).map((estado, i) => (
                      <div
                        key={i}
                        className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white/70" : ESTADO_DOT[estado])}
                      />
                    ))}
                  </div>
                )}
                {dayCitas.length > 3 && !isSelected && (
                  <span className="text-[9px] text-[var(--color-text-subtle)] mt-0.5">+{dayCitas.length - 3}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-[var(--color-border-dark)] flex flex-wrap gap-3">
        {(Object.entries(ESTADO_DOT) as [EstadoCita, string][]).map(([estado, color]) => (
          <div key={estado} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <span className="text-[10px] text-[var(--color-text-subtle)] capitalize">{estado.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  )
}