"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, CalendarDays, ChevronDown, Filter, Menu, Plus, Search } from "lucide-react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { AgendaCalendar } from "@/components/agenda/AgendaCalendar"
import { CitaRow } from "@/components/agenda/CitaRow"
import { CitaModal } from "@/components/agenda/CitaModal"
import type { Cita, EstadoCita } from "@/types"
import { ESTADO_CITA_LABELS, ESPECIALIDAD_LABELS, cn, formatDate } from "@/lib/utils"

interface Doctor { id: string; nombre: string; especialidad: string }
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

export default function AgendaPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const [citas, setCitas] = useState<Cita[]>([])
  const [doctores, setDoctores] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtrodoctor, setFiltroDoctor] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<EstadoCita | "">("")
  const [busqueda, setBusqueda] = useState("")
  const [showFiltros, setShowFiltros] = useState(false)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCita, setEditingCita] = useState<Cita | null>(null)

  // Cargar citas del mes completo
  const fetchCitas = useCallback(async () => {
    setLoading(true)
    const mes = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
    const params = new URLSearchParams({ clinicaId: "1", mes })
    if (filtrodoctor) params.set("doctorId", filtrodoctor)
    if (filtroEstado) params.set("estado", filtroEstado)
    try {
      const res = await fetch(`/api/agenda/citas?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setCitas(json.data.citas)
        setDoctores(json.data.doctores)
      }
    } finally {
      setLoading(false)
    }
  }, [currentMonth, currentYear, filtrodoctor, filtroEstado])

  useEffect(() => { fetchCitas() }, [fetchCitas])

  // Citas del dia seleccionado (filtradas por busqueda)
  const selectedDateStr = selectedDate.toISOString().split("T")[0]
  const citasDelDia = citas
    .filter((c) => c.fecha.startsWith(selectedDateStr))
    .filter((c) => !busqueda || c.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()) || c.doctorNombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  // Conteo de citas por estado para el dia
  const countByEstado = citasDelDia.reduce<Record<string, number>>((acc, c) => {
    acc[c.estado] = (acc[c.estado] ?? 0) + 1
    return acc
  }, {})

  function handleSelectDay(day: number) {
    setSelectedDate(new Date(currentYear, currentMonth, day))
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }
  function goToToday() {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDate(today)
  }

  async function handleSave(data: Record<string, unknown>) {
    const isEdit = !!data.id
    const method = isEdit ? "PATCH" : "POST"
    const body = isEdit
      ? { id: data.id, pacienteNombre: data.pacienteNombre, doctorId: data.doctorId, fecha: data.fecha, duracionMinutos: data.duracionMinutos, tratamiento: data.tratamiento, notas: data.notas, esTurismo: data.esTurismo }
      : { clinicaId: "1", ...data }
    await fetch("/api/agenda/citas", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setModalOpen(false)
    setEditingCita(null)
    await fetchCitas()
  }

  async function handleCancel(id: string) {
    if (!confirm("¿Cancelar esta cita?")) return
    await fetch(`/api/agenda/citas?id=${id}`, { method: "DELETE" })
    await fetchCitas()
  }

  function openNew() { setEditingCita(null); setModalOpen(true) }
  function openEdit(cita: Cita) { setEditingCita(cita); setModalOpen(true) }

  const activeFilters = [filtrodoctor, filtroEstado].filter(Boolean).length

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
                <CalendarDays className="h-4 w-4 text-[var(--color-primary-light)]" />
                Agenda de Citas
              </h1>
              <p className="text-[var(--color-text-subtle)] text-xs capitalize">{formatDate(today.toISOString())}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-secondary)] rounded-full" />
            </button>
            <button onClick={openNew} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              Nueva cita
            </button>
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">SP</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {/* Busqueda */}
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-subtle)]" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar paciente o doctor..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-xl text-white text-sm placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
              />
            </div>

            {/* Filtro doctor */}
            <div className="relative">
              <select
                value={filtrodoctor}
                onChange={(e) => setFiltroDoctor(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-xl text-[var(--color-text-muted)] text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors cursor-pointer"
              >
                <option value="">Todos los doctores</option>
                {doctores.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-subtle)] pointer-events-none" />
            </div>

            {/* Filtro estado */}
            <div className="relative">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as EstadoCita | "")}
                className="appearance-none pl-3 pr-8 py-2 bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-xl text-[var(--color-text-muted)] text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors cursor-pointer"
              >
                <option value="">Todos los estados</option>
                {(Object.keys(ESTADO_CITA_LABELS) as EstadoCita[]).map((e) => (
                  <option key={e} value={e}>{ESTADO_CITA_LABELS[e]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-subtle)] pointer-events-none" />
            </div>

            {activeFilters > 0 && (
              <button onClick={() => { setFiltroDoctor(""); setFiltroEstado("") }} className="px-3 py-2 rounded-xl text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors">
                Limpiar ({activeFilters})
              </button>
            )}

            {/* Boton nueva cita mobile */}
            <button onClick={openNew} className="sm:hidden ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-brand text-white text-sm font-medium">
              <Plus className="h-4 w-4" />
              Nueva
            </button>
          </div>

          {/* Grid principal */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            {/* Calendario - 2 cols */}
            <div className="xl:col-span-2">
              <AgendaCalendar
                citas={citas}
                selectedDate={selectedDate}
                currentMonth={currentMonth}
                currentYear={currentYear}
                onSelectDate={handleSelectDay}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                onGoToToday={goToToday}
              />
            </div>

            {/* Lista de citas del dia - 3 cols */}
            <div className="xl:col-span-3 flex flex-col gap-3">
              {/* Header del dia */}
              <div className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-white font-semibold">
                      {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
                    </h3>
                    <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">
                      {citasDelDia.length} cita{citasDelDia.length !== 1 ? "s" : ""} programadas
                    </p>
                  </div>
                  {/* Resumen de estados */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(countByEstado).map(([estado, count]) => (
                      <span key={estado} className="text-[10px] font-medium px-2 py-1 rounded-full bg-[var(--color-bg-dark)] text-[var(--color-text-muted)] border border-[var(--color-border-dark)]">
                        {count} {ESTADO_CITA_LABELS[estado as EstadoCita]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lista */}
              {loading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-[var(--color-surface-dark)] rounded-xl border border-[var(--color-border-dark)] animate-pulse" />
                  ))}
                </div>
              ) : citasDelDia.length === 0 ? (
                <div className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-dark)] flex items-center justify-center mb-3">
                    <CalendarDays className="h-7 w-7 text-[var(--color-text-subtle)]" />
                  </div>
                  <p className="text-white font-medium text-sm">Sin citas este dia</p>
                  <p className="text-[var(--color-text-subtle)] text-xs mt-1 mb-4">
                    {busqueda ? "No hay resultados para tu busqueda" : "Puedes agregar una nueva cita"}
                  </p>
                  {!busqueda && (
                    <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
                      <Plus className="h-4 w-4" />
                      Nueva cita
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {citasDelDia.map((cita) => (
                    <CitaRow key={cita.id} cita={cita} onEdit={openEdit} onCancel={handleCancel} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      <CitaModal
        open={modalOpen}
        cita={editingCita}
        defaultDate={selectedDateStr}
        doctores={doctores}
        onClose={() => { setModalOpen(false); setEditingCita(null) }}
        onSave={handleSave as never}
      />
    </div>
  )
}