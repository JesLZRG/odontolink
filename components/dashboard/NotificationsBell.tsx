"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, CalendarPlus } from "lucide-react"
import type { Cita } from "@/types"
import { ESPECIALIDAD_LABELS, cn, formatTime } from "@/lib/utils"

interface NotificationsBellProps {
  dropdownPosition?: "top" | "bottom"
}

export function NotificationsBell({ dropdownPosition = "bottom" }: NotificationsBellProps) {
  const [open, setOpen] = useState(false)
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  function toggle() {
    setOpen((prev) => !prev)
    if (!loaded) {
      setLoading(true)
      fetch("/api/dashboard/notificaciones")
        .then((r) => r.json())
        .then((json) => { if (json.success) setCitas(json.data) })
        .finally(() => { setLoading(false); setLoaded(true) })
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggle}
        className="relative p-2 rounded-xl text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors"
        title="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {citas.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-secondary)] rounded-full" />
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 w-80 max-h-96 overflow-y-auto bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-2xl shadow-xl z-50",
            dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="px-4 py-3 border-b border-[var(--color-border-dark)]">
            <p className="text-white text-sm font-semibold">Citas recien agendadas</p>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-[var(--color-bg-dark)] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : citas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <CalendarPlus className="h-6 w-6 text-[var(--color-text-subtle)] mb-2" />
              <p className="text-[var(--color-text-subtle)] text-xs">Sin citas recientes</p>
            </div>
          ) : (
            <div className="flex flex-col p-2 gap-1">
              {citas.map((cita) => (
                <div
                  key={cita.id}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                  )}
                >
                  <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
                    <CalendarPlus className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{cita.pacienteNombre}</p>
                    <p className="text-[var(--color-text-subtle)] text-xs truncate">
                      {ESPECIALIDAD_LABELS[cita.tratamiento] ?? cita.tratamiento} con {cita.doctorNombre}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                      {formatTime(cita.fecha)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
