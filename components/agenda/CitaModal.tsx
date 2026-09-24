"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Loader2, Plane } from "lucide-react"
import type { Cita } from "@/types"
import { ESPECIALIDAD_LABELS, ESTADO_CITA_LABELS, cn } from "@/lib/utils"

interface Doctor { id: string; nombre: string; especialidad: string }

const citaSchema = z.object({
  pacienteNombre: z.string().min(2, "Nombre requerido (min 2 caracteres)"),
  doctorId: z.string().min(1, "Selecciona un doctor"),
  fecha: z.string().min(1, "Fecha requerida"),
  hora: z.string().min(1, "Hora requerida"),
  tratamiento: z.string().min(1, "Selecciona un tratamiento"),
  duracionMinutos: z.coerce.number().min(15).max(240),
  notas: z.string().optional(),
  esTurismo: z.boolean().optional(),
})
type CitaFormData = z.infer<typeof citaSchema>

interface CitaModalProps {
  open: boolean
  cita?: Cita | null   // null = crear nuevo
  defaultDate?: string // "YYYY-MM-DD"
  doctores: Doctor[]
  onClose: () => void
  onSave: (data: CitaFormData & { id?: string }) => Promise<void>
}

const ESPECIALIDADES = Object.keys(ESPECIALIDAD_LABELS) as (keyof typeof ESPECIALIDAD_LABELS)[]
const ESTADOS = Object.keys(ESTADO_CITA_LABELS)

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

const INPUT_CLS = "w-full bg-[var(--color-bg-dark)] border border-[var(--color-border-dark)] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]/60 focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
const SELECT_CLS = cn(INPUT_CLS, "cursor-pointer")

export function CitaModal({ open, cita, defaultDate, doctores, onClose, onSave }: CitaModalProps) {
  const isEdit = !!cita

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CitaFormData>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      pacienteNombre: "",
      doctorId: "",
      fecha: defaultDate ?? new Date().toISOString().split("T")[0],
      hora: "09:00",
      tratamiento: "",
      duracionMinutos: 60,
      notas: "",
      esTurismo: false,
    },
  })

  useEffect(() => {
    if (cita) {
      const citaDate = new Date(cita.fecha)
      reset({
        pacienteNombre: cita.pacienteNombre,
        doctorId: cita.doctorId,
        fecha: cita.fecha.split("T")[0],
        // UTC: las citas se guardan sin zona horaria real (hora "de pared" de la clinica)
        hora: `${String(citaDate.getUTCHours()).padStart(2, "0")}:${String(citaDate.getUTCMinutes()).padStart(2, "0")}`,
        tratamiento: cita.tratamiento,
        duracionMinutos: cita.duracionMinutos,
        notas: cita.notas ?? "",
        esTurismo: cita.esTurismo,
      })
    } else {
      reset({
        pacienteNombre: "",
        doctorId: "",
        fecha: defaultDate ?? new Date().toISOString().split("T")[0],
        hora: "09:00",
        tratamiento: "",
        duracionMinutos: 60,
        notas: "",
        esTurismo: false,
      })
    }
  }, [cita, defaultDate, reset, open])

  if (!open) return null

  const onSubmit = async (data: CitaFormData) => {
    const fechaCompleta = `${data.fecha}T${data.hora}:00`
    await onSave({ ...data, fecha: fechaCompleta, id: cita?.id })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--color-surface-dark)] rounded-2xl border border-[var(--color-border-dark)] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-dark)]">
          <div>
            <h2 className="text-white font-semibold">{isEdit ? "Editar Cita" : "Nueva Cita"}</h2>
            <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">
              {isEdit ? `Editando cita de ${cita?.pacienteNombre}` : "Completa los datos de la cita"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-4">
          <Field label="Paciente" error={errors.pacienteNombre?.message}>
            <input {...register("pacienteNombre")} placeholder="Nombre completo del paciente" className={INPUT_CLS} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha" error={errors.fecha?.message}>
              <input {...register("fecha")} type="date" className={INPUT_CLS} />
            </Field>
            <Field label="Hora" error={errors.hora?.message}>
              <input {...register("hora")} type="time" className={INPUT_CLS} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tratamiento" error={errors.tratamiento?.message}>
              <select {...register("tratamiento")} className={SELECT_CLS}>
                <option value="">Seleccionar...</option>
                {ESPECIALIDADES.map((e) => (
                  <option key={e} value={e}>{ESPECIALIDAD_LABELS[e]}</option>
                ))}
              </select>
            </Field>
            <Field label="Duracion (min)" error={errors.duracionMinutos?.message}>
              <select {...register("duracionMinutos")} className={SELECT_CLS}>
                {[15, 30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Doctor" error={errors.doctorId?.message}>
            <select {...register("doctorId")} className={SELECT_CLS}>
              <option value="">Seleccionar doctor...</option>
              {doctores.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </Field>

          <Field label="Notas (opcional)">
            <textarea {...register("notas")} rows={2} placeholder="Observaciones, indicaciones especiales..." className={cn(INPUT_CLS, "resize-none")} />
          </Field>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input {...register("esTurismo")} type="checkbox" className="w-4 h-4 rounded border-[var(--color-border-dark)] accent-[var(--color-primary)]" />
            <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] group-hover:text-white transition-colors">
              <Plane className="h-3.5 w-3.5" />
              Paciente de turismo medico (EE.UU. / Canada)
            </span>
          </label>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border-dark)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-border-dark)] transition-all text-sm font-medium">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl gradient-brand text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}