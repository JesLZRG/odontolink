"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Mail, Menu, Phone, Stethoscope, User } from "lucide-react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { NotificationsBell } from "@/components/dashboard/NotificationsBell"
import { useSession } from "@/components/auth/useSession"
import type { PacienteDetalle } from "@/lib/clinicas/pacientes"
import {
  ESPECIALIDAD_LABELS,
  ESTADO_CITA_COLORS,
  ESTADO_CITA_LABELS,
  cn,
  formatDate,
  formatTime,
  getInitials,
} from "@/lib/utils"

export default function PacienteDetallePage() {
  const params = useParams<{ id: string }>()
  const { user } = useSession()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [paciente, setPaciente] = useState<PacienteDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/dashboard/pacientes/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setPaciente(json.data)
        else setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  return (
    <div className="flex h-screen bg-[var(--color-bg-dark)] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-[var(--color-surface-dark)] border-b border-[var(--color-border-dark)] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href="/dashboard/pacientes"
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors"
              title="Volver a pacientes"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-white font-semibold text-sm sm:text-base">
                {loading ? "Cargando..." : paciente?.nombre ?? "Paciente"}
              </h1>
              <p className="text-[var(--color-text-subtle)] text-xs">Historial de citas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <Link
              href="/cuenta"
              title="Mi cuenta"
              className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              {user ? getInitials(user.nombre) : ""}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col gap-3">
              <div className="h-28 bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] animate-pulse" />
              ))}
            </div>
          ) : notFound || !paciente ? (
            <div className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] flex flex-col items-center justify-center py-16 text-center">
              <p className="text-white font-medium text-sm">Paciente no encontrado</p>
              <p className="text-[var(--color-text-subtle)] text-xs mt-1 mb-4">
                No existe o no pertenece a tu clinica
              </p>
              <Link href="/dashboard/pacientes" className="text-[var(--color-primary-light)] text-sm font-medium">
                Volver a pacientes
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5 max-w-3xl">
              {/* Ficha del paciente */}
              <div className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {getInitials(paciente.nombre)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-semibold text-lg truncate">{paciente.nombre}</h2>
                    <div className="flex flex-wrap items-center gap-4 mt-1.5">
                      {paciente.email && (
                        <span className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-sm">
                          <Mail className="h-3.5 w-3.5" />
                          {paciente.email}
                        </span>
                      )}
                      {paciente.telefono && (
                        <span className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-sm">
                          <Phone className="h-3.5 w-3.5" />
                          {paciente.telefono}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="bg-[var(--color-bg-dark)] rounded-xl border border-[var(--color-border-dark)] p-3 text-center">
                    <p className="text-white text-xl font-bold">{paciente.totalCitas}</p>
                    <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">Citas totales</p>
                  </div>
                  <div className="bg-[var(--color-bg-dark)] rounded-xl border border-[var(--color-border-dark)] p-3 text-center">
                    <p className="text-white text-xs font-semibold capitalize">
                      {paciente.proximaCita ? formatDate(paciente.proximaCita) : "Sin cita futura"}
                    </p>
                    <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">Proxima cita</p>
                  </div>
                  <div className="bg-[var(--color-bg-dark)] rounded-xl border border-[var(--color-border-dark)] p-3 text-center">
                    <p className="text-white text-xs font-semibold capitalize">{formatDate(paciente.ultimaCita)}</p>
                    <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">Ultima cita</p>
                  </div>
                </div>
              </div>

              {/* Historial de citas */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[var(--color-primary-light)]" />
                  Historial de citas ({paciente.citas.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {paciente.citas.map((cita) => (
                    <div
                      key={cita.id}
                      className="flex items-center gap-4 p-4 bg-[var(--color-surface-dark)] rounded-xl border border-[var(--color-border-dark)]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium capitalize">{formatDate(cita.fecha)}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs">
                            <User className="h-3 w-3" />
                            {cita.doctorNombre}
                          </span>
                          <span className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs">
                            <Stethoscope className="h-3 w-3" />
                            {ESPECIALIDAD_LABELS[cita.tratamiento] ?? cita.tratamiento}
                          </span>
                          <span className="text-[var(--color-text-subtle)] text-xs">
                            {formatTime(cita.fecha)}
                          </span>
                        </div>
                      </div>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0", ESTADO_CITA_COLORS[cita.estado])}>
                        {ESTADO_CITA_LABELS[cita.estado]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
