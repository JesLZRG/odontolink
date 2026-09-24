import { z } from "zod"
import { emailSchema } from "@/lib/auth/schemas"

// Formulario publico de "agendar cita" en la pagina de detalle de clinica
export const agendarCitaSchema = z.object({
  clinicaId: z.string().min(1),
  doctorId: z.string().min(1, "Selecciona un doctor"),
  tratamiento: z.string().min(1, "Selecciona una especialidad"),
  fecha: z.string().min(1, "Selecciona fecha y hora"),
  pacienteNombre: z.string().trim().min(2, "Ingresa tu nombre completo").max(120),
  pacienteEmail: emailSchema,
  notas: z.string().trim().max(500).optional(),
  esTurismo: z.boolean().optional(),
})
