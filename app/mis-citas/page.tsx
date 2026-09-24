"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CalendarClock, Loader2, LogOut, MapPin, Plane, Stethoscope } from "lucide-react"
import { logout, useSession } from "@/components/auth/useSession"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ESPECIALIDAD_LABELS, ESTADO_CITA_LABELS, formatDate, formatTime } from "@/lib/utils"
import type { Cita } from "@/types"

interface CitaConClinica extends Cita {
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

function CitaCard({ cita }: { cita: CitaConClinica }) {
  return (
    <Card variant="light">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900">{cita.clinicaNombre}</h3>
            {cita.esTurismo && (
              <span title="Turismo medico"><Plane className="h-3.5 w-3.5 text-[var(--color-primary)]" /></span>
            )}
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <Stethoscope className="h-3.5 w-3.5 flex-shrink-0" />
            {cita.doctorNombre} · {ESPECIALIDAD_LABELS[cita.tratamiento] ?? cita.tratamiento}
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 capitalize">
            <CalendarClock className="h-3.5 w-3.5 flex-shrink-0" />
            {formatDate(cita.fecha)} · {formatTime(cita.fecha)}
          </p>
          {cita.notas && <p className="text-xs text-slate-400 mt-1.5">{cita.notas}</p>}
        </div>
        <Badge variant={ESTADO_BADGE[cita.estado] ?? "outline"} className="self-start sm:self-center flex-shrink-0">
          {ESTADO_CITA_LABELS[cita.estado] ?? cita.estado}
        </Badge>
      </CardContent>
    </Card>
  )
}

export default function MisCitasPage() {
  const { user, loading: loadingUser } = useSession()
  const [citas, setCitas] = useState<CitaConClinica[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = "Mis citas | OdontoLink"
  }, [])

  useEffect(() => {
    fetch("/api/mis-citas")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCitas(json.data)
        else setError(json.message ?? "No se pudieron cargar tus citas")
      })
      .catch(() => setError("Error de conexion. Intenta de nuevo."))
      .finally(() => setLoading(false))
  }, [])

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
      </div>
    )
  }

  const ahora = Date.now()
  const proximas = (citas ?? []).filter((c) => new Date(c.fecha).getTime() >= ahora && c.estado !== "cancelada")
  const pasadas = (citas ?? []).filter((c) => new Date(c.fecha).getTime() < ahora || c.estado === "cancelada")

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/directorio" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="OdontoLink" width={36} height={36} className="object-contain" />
            <span className="text-lg font-bold gradient-brand-text">OdontoLink</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">
        <Link
          href="/directorio"
          className="text-sm text-slate-500 hover:text-[var(--color-primary)] inline-flex items-center gap-1.5 self-start transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al directorio
        </Link>

        <div>
          <h1 className="text-xl font-bold text-slate-900">Mis citas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Citas que has agendado con clinicas de OdontoLink.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : (citas ?? []).length === 0 ? (
          <Card variant="light">
            <CardContent className="p-8 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-[var(--color-primary)] flex items-center justify-center">
                <CalendarClock className="h-7 w-7" />
              </div>
              <p className="text-slate-600 text-sm">Todavia no tienes citas agendadas.</p>
              <Link href="/directorio" className="text-sm font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Buscar una clinica
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {proximas.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Proximas</h2>
                {proximas.map((c) => <CitaCard key={c.id} cita={c} />)}
              </div>
            )}
            {pasadas.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Historial</h2>
                {pasadas.map((c) => <CitaCard key={c.id} cita={c} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
