"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Plus, UserCog, X } from "lucide-react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { NotificationsBell } from "@/components/dashboard/NotificationsBell"
import { Button } from "@/components/ui/button"
import { useSession } from "@/components/auth/useSession"
import { cn, formatDate, getInitials } from "@/lib/utils"
import type { MiembroEquipo } from "@/lib/clinicas/store"

export default function EquipoPage() {
  const router = useRouter()
  const { user, loading: loadingUser } = useSession()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [equipo, setEquipo] = useState<MiembroEquipo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const cargarEquipo = () => {
    setLoading(true)
    fetch("/api/dashboard/equipo")
      .then((r) => r.json())
      .then((json) => { if (json.success) setEquipo(json.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!loadingUser && user && user.rol !== "clinica") {
      router.replace("/dashboard/pacientes")
    }
  }, [loadingUser, user, router])

  useEffect(() => {
    cargarEquipo()
  }, [])

  async function toggleActivo(doctorId: string, activo: boolean) {
    setEquipo((prev) => prev.map((m) => (m.doctorId === doctorId ? { ...m, activo } : m)))
    await fetch(`/api/dashboard/equipo/${doctorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    })
  }

  return (
    <div className="flex h-screen bg-[var(--color-bg-dark)] overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-[var(--color-surface-dark)] border-b border-[var(--color-border-dark)] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                <UserCog className="h-4 w-4 text-[var(--color-primary-light)]" />
                Equipo
              </h1>
              <p className="text-[var(--color-text-subtle)] text-xs">
                {loading ? "Cargando..." : `${equipo.length} doctor${equipo.length !== 1 ? "es" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Agregar doctor
            </Button>
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] animate-pulse" />
              ))}
            </div>
          ) : equipo.length === 0 ? (
            <div className="bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-dark)] flex items-center justify-center mb-3">
                <UserCog className="h-7 w-7 text-[var(--color-text-subtle)]" />
              </div>
              <p className="text-white font-medium text-sm">Todavia no tienes doctores en tu equipo</p>
              <p className="text-[var(--color-text-subtle)] text-xs mt-1">
                Agrega a tus doctores para que puedan iniciar sesion y ver sus pacientes
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-w-2xl">
              {equipo.map((m) => (
                <div
                  key={m.doctorId}
                  className="flex items-center gap-4 p-4 bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)]"
                >
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(m.nombre)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{m.nombre}</p>
                    <p className="text-[var(--color-text-subtle)] text-xs truncate">{m.email} &middot; {m.especialidad}</p>
                  </div>
                  <div className="hidden sm:block text-[var(--color-text-subtle)] text-xs flex-shrink-0">
                    Desde {formatDate(m.creadoEn)}
                  </div>
                  <button
                    onClick={() => toggleActivo(m.doctorId, !m.activo)}
                    className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 transition-colors",
                      m.activo
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                        : "bg-slate-500/10 border-slate-500/30 text-slate-400"
                    )}
                  >
                    {m.activo ? "Activo" : "Desactivado"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showForm && (
        <NuevoDoctorModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            cargarEquipo()
          }}
        />
      )}
    </div>
  )
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--color-text-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-[var(--color-border-dark)] bg-[var(--color-surface-dark-2)] text-white placeholder:text-[var(--color-text-subtle)] h-11 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
      />
    </label>
  )
}

function NuevoDoctorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [especialidad, setEspecialidad] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/dashboard/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, especialidad }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.message ?? "No se pudo crear el doctor")
        return
      }
      onCreated()
    } catch {
      setError("Error de conexion. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-base">Agregar doctor</h2>
          <button onClick={onClose} className="text-[var(--color-text-subtle)] hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <Campo label="Nombre completo" value={nombre} onChange={setNombre} placeholder="Dr. Juan Perez" required />
          <Campo label="Especialidad" value={especialidad} onChange={setEspecialidad} placeholder="Ortodoncia" required />
          <Campo label="Correo electronico" type="email" value={email} onChange={setEmail} placeholder="doctor@clinica.com" required />
          <Campo label="Contrasena temporal" type="password" value={password} onChange={setPassword} placeholder="Min. 8 caracteres, 1 mayuscula, 1 numero" required />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">{error}</div>
          )}

          <Button type="submit" variant="glow" size="lg" loading={submitting} className="w-full mt-1">
            {submitting ? "Creando..." : "Crear doctor"}
          </Button>
        </form>
      </div>
    </div>
  )
}
