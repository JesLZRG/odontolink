"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarCheck, CheckCircle2, ChevronDown, Loader2, Stethoscope } from "lucide-react"
import { useSession } from "@/components/auth/useSession"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ESPECIALIDAD_LABELS, cn } from "@/lib/utils"
import type { Clinica } from "@/types"

interface DoctorPublic {
  id: string
  nombre: string
  especialidad: string
}

interface BookingFormProps {
  clinica: Pick<Clinica, "id" | "horario">
  doctores: DoctorPublic[]
}

const DIAS_SEMANA: (keyof Clinica["horario"])[] = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
]

const DURACION_MINUTOS = 45

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

function generarSlots(horarioDia?: { abre: string; cierra: string }): string[] {
  if (!horarioDia) return []
  const [abreH, abreM] = horarioDia.abre.split(":").map(Number)
  const [cierraH, cierraM] = horarioDia.cierra.split(":").map(Number)
  const inicio = abreH * 60 + abreM
  const fin = cierraH * 60 + cierraM
  const slots: string[] = []
  for (let t = inicio; t + DURACION_MINUTOS <= fin; t += 30) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`)
  }
  return slots
}

function aMinutosUTC(iso: string): number {
  const d = new Date(iso)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

function slotAMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export function BookingForm({ clinica, doctores }: BookingFormProps) {
  const { user } = useSession({ required: false })
  const esPacienteLogueado = user?.rol === "paciente"

  const especialidades = useMemo(
    () => Array.from(new Set(doctores.map((d) => d.especialidad))),
    [doctores]
  )

  const [especialidad, setEspecialidad] = useState(especialidades[0] ?? "")
  const [doctorId, setDoctorId] = useState("")
  const [fecha, setFecha] = useState(hoyISO())
  const [hora, setHora] = useState("")
  const [ocupadas, setOcupadas] = useState<{ fecha: string; duracionMinutos: number }[]>([])
  const [loadingHoras, setLoadingHoras] = useState(false)

  const [pacienteNombre, setPacienteNombre] = useState("")
  const [pacienteEmail, setPacienteEmail] = useState("")
  const [notas, setNotas] = useState("")
  const [esTurismo, setEsTurismo] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const doctoresFiltrados = useMemo(
    () => doctores.filter((d) => d.especialidad === especialidad),
    [doctores, especialidad]
  )

  useEffect(() => {
    if (!doctoresFiltrados.some((d) => d.id === doctorId)) {
      setDoctorId(doctoresFiltrados[0]?.id ?? "")
    }
  }, [doctoresFiltrados, doctorId])

  useEffect(() => {
    if (esPacienteLogueado && user) {
      setPacienteNombre(user.nombre)
      setPacienteEmail(user.email)
    }
  }, [esPacienteLogueado, user])

  useEffect(() => {
    setHora("")
    if (!doctorId || !fecha) {
      setOcupadas([])
      return
    }
    setLoadingHoras(true)
    fetch(`/api/citas?doctorId=${doctorId}&fecha=${fecha}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOcupadas(json.data)
      })
      .finally(() => setLoadingHoras(false))
  }, [doctorId, fecha])

  const diaSemana = DIAS_SEMANA[new Date(`${fecha}T00:00:00Z`).getUTCDay()]
  const horarioDia = clinica.horario[diaSemana]
  const slots = useMemo(() => generarSlots(horarioDia), [horarioDia])

  const slotsConDisponibilidad = slots.map((slot) => {
    const inicio = slotAMinutos(slot)
    const fin = inicio + DURACION_MINUTOS
    const ocupado = ocupadas.some((c) => {
      const cInicio = aMinutosUTC(c.fecha)
      const cFin = cInicio + c.duracionMinutos
      return inicio < cFin && cInicio < fin
    })
    return { slot, ocupado }
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!doctorId) return setError("Selecciona un doctor")
    if (!hora) return setError("Selecciona un horario disponible")
    if (!pacienteNombre.trim()) return setError("Ingresa tu nombre")
    if (!pacienteEmail.trim()) return setError("Ingresa tu correo")

    setSubmitting(true)
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicaId: clinica.id,
          doctorId,
          tratamiento: especialidad,
          fecha: `${fecha}T${hora}:00`,
          pacienteNombre,
          pacienteEmail,
          notas,
          esTurismo,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.message ?? "No se pudo agendar la cita")
        return
      }
      setExito(true)
      setHora("")
    } catch {
      setError("Error de conexion. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (doctores.length === 0) {
    return (
      <Card variant="light">
        <CardContent className="p-5 text-sm text-slate-500">
          Esta clinica todavia no tiene doctores dados de alta para agendar citas en linea.
          Llama al telefono de la clinica para agendar directamente.
        </CardContent>
      </Card>
    )
  }

  if (exito) {
    return (
      <Card variant="light">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-slate-900">Cita agendada</h3>
          <p className="text-sm text-slate-500">
            Te confirmamos tu cita para el {fecha}. La clinica la vera en su agenda y se pondra en contacto contigo a {pacienteEmail}.
          </p>
          <Button variant="outline" size="sm" onClick={() => setExito(false)}>
            Agendar otra cita
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="light" className="sticky top-20">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-[var(--color-primary)] flex items-center justify-center">
            <CalendarCheck className="h-4.5 w-4.5" />
          </div>
          <h2 className="font-bold text-slate-900">Agenda tu cita</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Especialidad */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Especialidad</label>
            <div className="relative">
              <select
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white h-11 pl-4 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {especialidades.map((e) => (
                  <option key={e} value={e}>{ESPECIALIDAD_LABELS[e] ?? e}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Doctor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Doctor</label>
            <div className="relative">
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white h-11 pl-4 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {doctoresFiltrados.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
              <Stethoscope className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Fecha</label>
            <input
              type="date"
              value={fecha}
              min={hoyISO()}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white h-11 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Horas disponibles */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Horario disponible</label>
            {loadingHoras ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 h-11">
                <Loader2 className="h-4 w-4 animate-spin" /> Buscando horarios...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">La clinica no atiende este dia. Elige otra fecha.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slotsConDisponibilidad.map(({ slot, ocupado }) => (
                  <button
                    key={slot}
                    type="button"
                    disabled={ocupado}
                    onClick={() => setHora(slot)}
                    className={cn(
                      "h-9 rounded-lg text-xs font-medium border transition-colors",
                      ocupado
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through"
                        : hora === slot
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-[var(--color-primary)]"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paciente */}
          <div className="border-t border-slate-100 pt-3.5 flex flex-col gap-3">
            {esPacienteLogueado ? (
              <p className="text-xs text-slate-500">
                Agendando como <span className="font-medium text-slate-700">{pacienteNombre}</span> ({pacienteEmail})
              </p>
            ) : (
              <>
                <Input
                  label="Tu nombre completo"
                  value={pacienteNombre}
                  onChange={(e) => setPacienteNombre(e.target.value)}
                  placeholder="Nombre y apellido"
                />
                <Input
                  label="Tu correo"
                  type="email"
                  value={pacienteEmail}
                  onChange={(e) => setPacienteEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                />
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Notas (opcional)</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                placeholder="Cuentanos brevemente que necesitas"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={esTurismo}
                onChange={(e) => setEsTurismo(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-[var(--color-primary)]"
              />
              <span className="text-sm text-slate-600">Vengo de EE.UU. / Canada</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

          <Button type="submit" variant="glow" disabled={submitting} className="w-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar cita
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
