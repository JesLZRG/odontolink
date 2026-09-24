"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Mail, Menu, Phone, Search, Users } from "lucide-react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { NotificationsBell } from "@/components/dashboard/NotificationsBell"
import { useSession } from "@/components/auth/useSession"
import type { PacienteResumen } from "@/lib/clinicas/pacientes"
import { ESTADO_CITA_COLORS, ESTADO_CITA_LABELS, cn, formatDate, getInitials } from "@/lib/utils"

export default function PacientesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { user } = useSession()

  const [pacientes, setPacientes] = useState<PacienteResumen[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    fetch("/api/dashboard/pacientes")
      .then((r) => r.json())
      .then((json) => { if (json.success) setPacientes(json.data) })
      .finally(() => setLoading(false))
  }, [])

  const pacientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return pacientes
    return pacientes.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
    )
  }, [pacientes, busqueda])

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
            <div>
              <h1 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--color-primary-light)]" />
                Pacientes
              </h1>
              <p className="text-[var(--color-text-subtle)] text-xs">
                {loading ? "Cargando..." : `${pacientes.length} paciente${pacientes.length !== 1 ? "s" : ""}`}
              </p>
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
          {/* Busqueda */}
          <div className="relative max-w-xs mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-subtle)]" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar paciente por nombre o correo..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-xl text-white text-sm placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
            />
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] animate-pulse" />
              ))}
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-dark)] flex items-center justify-center mb-3">
                <Users className="h-7 w-7 text-[var(--color-text-subtle)]" />
              </div>
              <p className="text-white font-medium text-sm">
                {busqueda ? "Sin resultados" : "Todavia no tienes pacientes"}
              </p>
              <p className="text-[var(--color-text-subtle)] text-xs mt-1">
                {busqueda ? "Intenta con otro nombre o correo" : "Apareceran aqui cuando agendes su primera cita"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pacientesFiltrados.map((paciente) => (
                <Link
                  key={paciente.id}
                  href={`/dashboard/pacientes/${paciente.id}`}
                  className="group flex items-center gap-4 p-4 bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] hover:border-[var(--color-primary)]/30 transition-all duration-150"
                >
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(paciente.nombre)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-[var(--color-primary-light)] transition-colors">
                      {paciente.nombre}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {paciente.email && (
                        <span className="flex items-center gap-1 text-[var(--color-text-subtle)] text-xs truncate">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {paciente.email}
                        </span>
                      )}
                      {paciente.telefono && (
                        <span className="flex items-center gap-1 text-[var(--color-text-subtle)] text-xs">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          {paciente.telefono}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", ESTADO_CITA_COLORS[paciente.ultimoEstado])}>
                      {ESTADO_CITA_LABELS[paciente.ultimoEstado]}
                    </span>
                    <p className="text-[var(--color-text-muted)] text-xs">
                      {paciente.totalCitas} cita{paciente.totalCitas !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="hidden md:block text-right flex-shrink-0 w-32">
                    <p className="text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wide">
                      {paciente.proximaCita ? "Proxima cita" : "Ultima cita"}
                    </p>
                    <p className="text-white text-xs mt-0.5 capitalize">
                      {formatDate(paciente.proximaCita ?? paciente.ultimaCita)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
