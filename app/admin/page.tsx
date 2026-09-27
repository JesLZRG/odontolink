"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, Building2, CalendarClock, Check, Clock, Loader2, LogOut, Search, ShieldCheck, User, Users, X } from "lucide-react"
import { logout, useSession } from "@/components/auth/useSession"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ESTADO_CITA_LABELS, formatTime, getInitials } from "@/lib/utils"
import type { Cita, Clinica, Usuario } from "@/types"

interface Listas {
  clinicas: Usuario[]
  pacientes: Usuario[]
}

interface CitaAdmin extends Cita {
  clinicaNombre: string
}

const ESTADO_BADGE: Record<string, "default" | "primary" | "secondary" | "outline" | "ghost"> = {
  programada: "outline",
  confirmada: "primary",
  en_curso: "primary",
  completada: "secondary",
  cancelada: "ghost",
  no_asistio: "ghost",
}

function formatFechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", timeZone: "UTC" })
}

const ESTADOS_FILTRO_CITAS = ["confirmada", "programada", "en_curso", "cancelada"] as const

function TablaCitas({ citas }: { citas: CitaAdmin[] }) {
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")

  const citasFiltradas = useMemo(() => {
    if (filtroEstado === "todos") return citas
    return citas.filter((c) => c.estado === filtroEstado)
  }, [citas, filtroEstado])

  return (
    <Card variant="light">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-[var(--color-primary)] flex items-center justify-center">
            <CalendarClock className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Todas las citas del sistema</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
          >
            <option value="todos">Todos los estados</option>
            {ESTADOS_FILTRO_CITAS.map((estado) => (
              <option key={estado} value={estado}>{ESTADO_CITA_LABELS[estado] ?? estado}</option>
            ))}
          </select>
          <Badge variant="primary">{citasFiltradas.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {citasFiltradas.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            {filtroEstado === "todos" ? "Aun no hay citas agendadas." : "No hay citas con ese estado."}
          </p>
        ) : (
          <>
            {/* Mobile: tarjetas apiladas */}
            <div className="flex flex-col gap-2 sm:hidden">
              {citasFiltradas.map((c) => (
                <div key={c.id} className="border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.clinicaNombre}</p>
                    <Badge variant={ESTADO_BADGE[c.estado] ?? "outline"} size="sm" className="flex-shrink-0">
                      {ESTADO_CITA_LABELS[c.estado] ?? c.estado}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 truncate">{c.pacienteNombre}</p>
                  <p className="text-xs text-slate-500 truncate">Dr(a). {c.doctorNombre}</p>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-slate-400">{formatFechaCorta(c.fecha)}, {formatTime(c.fecha)}</p>
                    {c.esDemo ? (
                      <Badge size="sm" className="bg-amber-50 text-amber-600 border border-amber-200">Demo</Badge>
                    ) : (
                      <Badge size="sm" variant="secondary">Real</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <th className="pb-2 pr-4 font-semibold">Clinica</th>
                    <th className="pb-2 pr-4 font-semibold">Paciente</th>
                    <th className="pb-2 pr-4 font-semibold">Doctor</th>
                    <th className="pb-2 pr-4 font-semibold">Fecha</th>
                    <th className="pb-2 pr-4 font-semibold">Estado</th>
                    <th className="pb-2 font-semibold">Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 text-sm font-medium text-slate-900 whitespace-nowrap">{c.clinicaNombre}</td>
                      <td className="py-3 pr-4 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{c.pacienteNombre}</p>
                        {c.pacienteEmail && <p className="text-xs text-slate-400 truncate">{c.pacienteEmail}</p>}
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-600 whitespace-nowrap">{c.doctorNombre}</td>
                      <td className="py-3 pr-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatFechaCorta(c.fecha)}, {formatTime(c.fecha)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={ESTADO_BADGE[c.estado] ?? "outline"} size="sm">
                          {ESTADO_CITA_LABELS[c.estado] ?? c.estado}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {c.esDemo ? (
                          <Badge size="sm" className="bg-amber-50 text-amber-600 border border-amber-200">Demo</Badge>
                        ) : (
                          <Badge size="sm" variant="secondary">Real</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function ClinicasPendientes({ clinicas, onResuelta }: { clinicas: Clinica[]; onResuelta: (id: string) => void }) {
  const [procesando, setProcesando] = useState<string | null>(null)

  async function resolver(id: string, estadoAprobacion: "aprobada" | "rechazada") {
    setProcesando(id)
    try {
      const res = await fetch(`/api/admin/clinicas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estadoAprobacion }),
      })
      const json = await res.json()
      if (json.success) onResuelta(id)
    } finally {
      setProcesando(null)
    }
  }

  return (
    <Card variant="light">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Clinicas pendientes de aprobacion</h2>
        </div>
        <Badge variant="primary">{clinicas.length}</Badge>
      </CardHeader>
      <CardContent className="pt-0">
        {clinicas.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No hay clinicas esperando aprobacion.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {clinicas.map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getInitials(c.nombre)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{c.nombre}</p>
                  <p className="text-xs text-slate-500 truncate">{c.email} &middot; {c.ciudad}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolver(c.id, "rechazada")}
                    disabled={procesando === c.id}
                    className="!border-red-300 !text-red-600 hover:!bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" /> Rechazar
                  </Button>
                  <Button size="sm" onClick={() => resolver(c.id, "aprobada")} disabled={procesando === c.id}>
                    <Check className="h-3.5 w-3.5" /> Aprobar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
}

function FilaUsuario({ u, esClinica }: { u: Usuario; esClinica: boolean }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(u.nombre)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{u.nombre}</p>
            <p className="text-xs text-slate-500 truncate">{u.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 text-sm text-slate-600 whitespace-nowrap">{u.telefono ?? "—"}</td>
      <td className="py-3 pr-4 text-sm text-slate-600 whitespace-nowrap">{esClinica ? (u.ciudad ?? "—") : "—"}</td>
      <td className="py-3 pr-4">
        {u.emailVerificado ? (
          <Badge variant="secondary" size="sm">
            <BadgeCheck className="h-3 w-3" /> Verificado
          </Badge>
        ) : (
          <Badge variant="outline" size="sm">Sin verificar</Badge>
        )}
      </td>
      <td className="py-3 text-sm text-slate-500 whitespace-nowrap">{formatFecha(u.creadoEn)}</td>
    </tr>
  )
}

function TarjetaUsuario({ u, esClinica }: { u: Usuario; esClinica: boolean }) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {getInitials(u.nombre)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 truncate">{u.nombre}</p>
        <p className="text-xs text-slate-500 truncate">{u.email}</p>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          {u.telefono ?? "Sin telefono"}
          {esClinica && u.ciudad ? ` · ${u.ciudad}` : ""} · {formatFecha(u.creadoEn)}
        </p>
      </div>
      {u.emailVerificado ? (
        <Badge variant="secondary" size="sm" className="flex-shrink-0">
          <BadgeCheck className="h-3 w-3" /> Verificado
        </Badge>
      ) : (
        <Badge variant="outline" size="sm" className="flex-shrink-0">Sin verificar</Badge>
      )}
    </div>
  )
}

function TablaUsuarios({ titulo, icon: Icon, items, esClinica, vacio }: {
  titulo: string
  icon: typeof Users
  items: Usuario[]
  esClinica: boolean
  vacio: string
}) {
  const [busqueda, setBusqueda] = useState("")

  const itemsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (u) => u.nombre.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    )
  }, [items, busqueda])

  return (
    <Card variant="light">
      <CardHeader className="flex flex-col gap-3 pb-4">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-[var(--color-primary)] flex items-center justify-center">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
          </div>
          <Badge variant="primary">{itemsFiltrados.length}</Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {itemsFiltrados.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            {busqueda ? "Sin resultados para esa busqueda." : vacio}
          </p>
        ) : (
          <>
            {/* Mobile: tarjetas apiladas */}
            <div className="flex flex-col gap-2 sm:hidden">
              {itemsFiltrados.map((u) => (
                <TarjetaUsuario key={u.id} u={u} esClinica={esClinica} />
              ))}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <th className="pb-2 pr-4 font-semibold">Nombre / correo</th>
                    <th className="pb-2 pr-4 font-semibold">Telefono</th>
                    <th className="pb-2 pr-4 font-semibold">{esClinica ? "Ciudad" : ""}</th>
                    <th className="pb-2 pr-4 font-semibold">Estado</th>
                    <th className="pb-2 font-semibold">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsFiltrados.map((u) => (
                    <FilaUsuario key={u.id} u={u} esClinica={esClinica} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminPage() {
  const { user, loading: loadingUser } = useSession()
  const [listas, setListas] = useState<Listas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [citas, setCitas] = useState<CitaAdmin[] | null>(null)
  const [loadingCitas, setLoadingCitas] = useState(true)
  const [pendientes, setPendientes] = useState<Clinica[]>([])
  const [loadingPendientes, setLoadingPendientes] = useState(true)

  useEffect(() => {
    document.title = "Panel de administrador | OdontoLink"
  }, [])

  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setListas(json.data)
        else setError(json.message ?? "No se pudo cargar la informacion")
      })
      .catch(() => setError("Error de conexion. Intenta de nuevo."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch("/api/admin/citas")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCitas(json.data) })
      .finally(() => setLoadingCitas(false))
  }, [])

  useEffect(() => {
    fetch("/api/admin/clinicas")
      .then((r) => r.json())
      .then((json) => { if (json.success) setPendientes(json.data) })
      .finally(() => setLoadingPendientes(false))
  }, [])

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="OdontoLink" width={36} height={36} className="object-contain" />
            <div>
              <span className="text-lg font-bold gradient-brand-text block leading-tight">OdontoLink</span>
              <span className="text-xs text-slate-400 leading-none flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Panel de administrador
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/cuenta" className="text-sm text-slate-500 hover:text-[var(--color-primary)] transition-colors">
              {user.nombre}
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cuentas registradas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vista general de las clinicas y pacientes dados de alta en la plataforma.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>
        )}

        {loadingPendientes ? (
          <div className="h-48 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        ) : (
          <ClinicasPendientes
            clinicas={pendientes}
            onResuelta={(id) => setPendientes((prev) => prev.filter((c) => c.id !== id))}
          />
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          </div>
        ) : listas ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <TablaUsuarios
              titulo="Clinicas registradas"
              icon={Building2}
              items={listas.clinicas}
              esClinica
              vacio="Aun no hay clinicas registradas."
            />
            <TablaUsuarios
              titulo="Pacientes registrados"
              icon={User}
              items={listas.pacientes}
              esClinica={false}
              vacio="Aun no hay pacientes registrados."
            />
          </div>
        ) : null}

        {loadingCitas ? (
          <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        ) : (
          <TablaCitas citas={citas ?? []} />
        )}
      </main>
    </div>
  )
}
