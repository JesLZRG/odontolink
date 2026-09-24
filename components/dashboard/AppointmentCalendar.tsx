"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Cita } from "@/types"
import { ESPECIALIDAD_LABELS, cn, formatTime } from "@/lib/utils"

interface AppointmentCalendarProps {
  citas: Cita[]
}

const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function AppointmentCalendar({ citas }: AppointmentCalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate())

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  // Map citas by date of month
  const citasByDay = useMemo(() => {
    const map: Record<string, Cita[]> = {}
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

  const selectedCitas = citasByDay[selectedDate] ?? []

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  return (
    <div className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-dark)]">
        <div>
          <h2 className="text-white font-semibold">Calendario de Citas</h2>
          <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">
            {MONTHS[currentMonth]} {currentYear}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); setSelectedDate(today.getDate()) }}
            className="px-3 h-8 text-xs rounded-lg border border-[var(--color-primary)]/40 text-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/10 transition-colors font-medium"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-4">
        {/* Calendar grid */}
        <div>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-[var(--color-text-subtle)] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
              const isSelected = day === selectedDate
              const hasCitas = !!citasByDay[day]
              const citasCount = citasByDay[day]?.length ?? 0

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-150 text-xs font-medium",
                    isSelected
                      ? "bg-[var(--color-primary)] text-white shadow-lg glow-primary"
                      : isToday
                      ? "border border-[var(--color-primary)]/40 text-[var(--color-primary-light)]"
                      : "text-[var(--color-text-muted)] hover:bg-white/10 hover:text-white"
                  )}
                >
                  {day}
                  {hasCitas && !isSelected && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(citasCount, 3) }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-[var(--color-secondary)]" />
                      ))}
                    </div>
                  )}
                  {hasCitas && isSelected && (
                    <div className="w-1 h-1 rounded-full bg-white/80 mt-0.5" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected day citas */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[var(--color-text-muted)] text-xs font-medium">
              {selectedDate} de {MONTHS[currentMonth]} — {selectedCitas.length} cita{selectedCitas.length !== 1 ? "s" : ""}
            </p>
          </div>

          {selectedCitas.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-[var(--color-text-subtle)] text-xs">Sin citas este dia</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-40">
              {selectedCitas.map((cita) => (
                <div
                  key={cita.id}
                  className="flex items-center gap-2 p-2.5 bg-[var(--color-bg-dark)] rounded-xl border border-[var(--color-border-dark)]"
                >
                  <div className="w-1 h-8 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{cita.pacienteNombre}</p>
                    <p className="text-[var(--color-text-subtle)] text-xs truncate">{ESPECIALIDAD_LABELS[cita.tratamiento]}</p>
                  </div>
                  <span className="text-[var(--color-text-muted)] text-xs flex-shrink-0">{formatTime(cita.fecha)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
