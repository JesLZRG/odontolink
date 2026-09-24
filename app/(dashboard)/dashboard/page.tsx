"use client"

import { useEffect, useState } from "react"
import { CalendarDays, DollarSign, MessageSquare, Users } from "lucide-react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { AppointmentCalendar } from "@/components/dashboard/AppointmentCalendar"
import { TodayAppointments } from "@/components/dashboard/TodayAppointments"
import type { Cita, DashboardStats } from "@/types"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { useSession } from "@/components/auth/useSession"
import { NotificationsBell } from "@/components/dashboard/NotificationsBell"
import Link from "next/link"
import { Menu } from "lucide-react"

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [citas, setCitas] = useState<Cita[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingCitas, setLoadingCitas] = useState(true)
  const { user } = useSession()

  const now = new Date()
  const greeting = now.getHours() < 12 ? "Buenos dias" : now.getHours() < 18 ? "Buenas tardes" : "Buenas noches"

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((j) => { if (j.success) setStats(j.data) })
      .finally(() => setLoadingStats(false))
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    fetch(`/api/dashboard/citas?fecha=${today}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setCitas(j.data) })
      .finally(() => setLoadingCitas(false))
  }, [])

  const STATS_CONFIG = [
    {
      title: "Citas Hoy",
      value: stats?.citasHoy ?? "--",
      subtitle: `${stats?.tasaOcupacion ?? 0}% de ocupacion`,
      icon: CalendarDays,
      color: "primary" as const,
      trend: { value: 12, label: "vs ayer" },
    },
    {
      title: "Pacientes Activos",
      value: stats?.pacientesActivos ?? "--",
      subtitle: "en el mes",
      icon: Users,
      color: "secondary" as const,
      trend: { value: 8, label: "vs mes anterior" },
    },
    {
      title: "Ingresos del Mes",
      value: stats ? formatCurrency(stats.ingresosMes) : "--",
      subtitle: "USD estimados",
      icon: DollarSign,
      color: "warning" as const,
      trend: { value: 23, label: "vs mes anterior" },
    },
    {
      title: "Mensajes Nuevos",
      value: stats?.mensajesNuevos ?? "--",
      subtitle: "sin responder",
      icon: MessageSquare,
      color: "purple" as const,
      trend: { value: -2, label: "vs ayer" },
    },
  ]

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

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-[var(--color-surface-dark)] border-b border-[var(--color-border-dark)] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-white font-semibold text-sm sm:text-base">
                {greeting}, <span className="gradient-brand-text">{user?.nombre ?? ""}</span> 👋
              </h1>
              <p className="text-[var(--color-text-subtle)] text-xs capitalize">
                {formatDate(now.toISOString())}
              </p>
            </div>
          </div>

          {/* Header actions */}
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

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Stats Cards */}
          <section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS_CONFIG.map((stat) =>
                loadingStats ? (
                  <div key={stat.title} className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] h-32 animate-pulse" />
                ) : (
                  <StatsCard key={stat.title} {...stat} />
                )
              )}
            </div>
          </section>

          {/* Calendar + Appointments */}
          <section>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4" style={{ minHeight: "480px" }}>
              {/* Calendar: 3 cols */}
              <div className="xl:col-span-3">
                <AppointmentCalendar citas={citas} />
              </div>

              {/* Today appointments: 2 cols */}
              <div className="xl:col-span-2">
                <TodayAppointments citas={citas} loading={loadingCitas} />
              </div>
            </div>
          </section>

          {/* Quick actions bar */}
          <section className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] p-4">
            <p className="text-[var(--color-text-subtle)] text-xs font-semibold uppercase tracking-wider mb-3">Acciones rapidas</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Nueva cita", icon: "📅" },
                { label: "Nuevo paciente", icon: "👤" },
                { label: "Subir expediente", icon: "📁" },
                { label: "Enviar mensaje", icon: "💬" },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-bg-dark)] border border-[var(--color-border-dark)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40 hover:text-white transition-all text-sm"
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
