import { supabaseAdmin } from "@/lib/supabase/admin"
import { decodePacienteId } from "@/lib/clinicas/pacientes"
import type { Expediente, ExpedienteHistorialEntrada } from "@/types"

// ============================================================
// Expediente clinico de un paciente dentro de una clinica, con historial
// de cambios (que doctor lo edito y cuando). Esquema: sql/007_expedientes.sql
// ============================================================

interface ExpedienteRow {
  id: string
  clinica_id: string
  paciente_key: string
  notas: string
  actualizado_en: string
  actualizado_por_nombre: string | null
}

interface HistorialRow {
  id: string
  doctor_id: string | null
  doctor_nombre: string
  notas_anteriores: string
  notas_nuevas: string
  creado_en: string
}

function fromHistorialRow(row: HistorialRow): ExpedienteHistorialEntrada {
  return {
    id: row.id,
    doctorId: row.doctor_id ?? "",
    doctorNombre: row.doctor_nombre,
    notasAnteriores: row.notas_anteriores,
    notasNuevas: row.notas_nuevas,
    creadoEn: row.creado_en,
  }
}

// pacienteId es el id codificado (base64url) usado en lib/clinicas/pacientes.ts
export async function getExpediente(clinicaId: string, pacienteId: string): Promise<Expediente> {
  const pacienteKey = decodePacienteId(pacienteId)
  const client = supabaseAdmin()

  const { data: row, error } = await client
    .from("expedientes")
    .select("*")
    .eq("clinica_id", clinicaId)
    .eq("paciente_key", pacienteKey)
    .maybeSingle()
  if (error) throw error

  if (!row) {
    return { id: "", clinicaId, pacienteId, notas: "", actualizadoEn: "", historial: [] }
  }

  const { data: historial, error: histError } = await client
    .from("expediente_historial")
    .select("*")
    .eq("expediente_id", row.id)
    .order("creado_en", { ascending: false })
  if (histError) throw histError

  const expedienteRow = row as ExpedienteRow
  return {
    id: expedienteRow.id,
    clinicaId,
    pacienteId,
    notas: expedienteRow.notas,
    actualizadoEn: expedienteRow.actualizado_en,
    actualizadoPorNombre: expedienteRow.actualizado_por_nombre ?? undefined,
    historial: (historial as HistorialRow[]).map(fromHistorialRow),
  }
}

export interface ActualizarExpediente {
  notas: string
  doctorId?: string
  doctorNombre: string
}

export async function actualizarExpediente(
  clinicaId: string,
  pacienteId: string,
  data: ActualizarExpediente
): Promise<Expediente> {
  const pacienteKey = decodePacienteId(pacienteId)
  const client = supabaseAdmin()

  const { data: existente, error: findError } = await client
    .from("expedientes")
    .select("id, notas")
    .eq("clinica_id", clinicaId)
    .eq("paciente_key", pacienteKey)
    .maybeSingle()
  if (findError) throw findError

  const notasAnteriores = existente?.notas ?? ""
  let expedienteId = existente?.id as string | undefined

  if (expedienteId) {
    const { error } = await client
      .from("expedientes")
      .update({
        notas: data.notas,
        actualizado_en: new Date().toISOString(),
        actualizado_por_id: data.doctorId ?? null,
        actualizado_por_nombre: data.doctorNombre,
      })
      .eq("id", expedienteId)
    if (error) throw error
  } else {
    const { data: nuevo, error } = await client
      .from("expedientes")
      .insert({
        clinica_id: clinicaId,
        paciente_key: pacienteKey,
        notas: data.notas,
        actualizado_por_id: data.doctorId ?? null,
        actualizado_por_nombre: data.doctorNombre,
      })
      .select("id")
      .single()
    if (error) throw error
    expedienteId = (nuevo as { id: string }).id
  }

  const { error: histError } = await client.from("expediente_historial").insert({
    expediente_id: expedienteId,
    doctor_id: data.doctorId ?? null,
    doctor_nombre: data.doctorNombre,
    notas_anteriores: notasAnteriores,
    notas_nuevas: data.notas,
  })
  if (histError) throw histError

  return getExpediente(clinicaId, pacienteId)
}
