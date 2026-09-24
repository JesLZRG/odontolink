import { z } from "zod"

// Esquemas compartidos entre formularios (cliente) y rutas API (servidor)

export const passwordSchema = z
  .string()
  .min(8, "Minimo 8 caracteres")
  .max(128, "Maximo 128 caracteres")
  .regex(/[A-Z]/, "Debe contener una mayuscula")
  .regex(/[0-9]/, "Debe contener un numero")

export const emailSchema = z.string().trim().email("Ingresa un correo valido").max(254)

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contrasena"),
  rol: z.enum(["paciente", "clinica"]),
  recordarme: z.boolean().optional(),
})

export const registroSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre completo").max(120),
  email: emailSchema,
  password: passwordSchema,
  telefono: z.string().trim().min(10, "Telefono invalido").max(20),
  ciudad: z.string().trim().max(80).optional(),
  rol: z.enum(["paciente", "clinica"]),
})

export const perfilSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa un nombre valido").max(120),
  telefono: z.string().trim().min(10, "Telefono invalido").max(20).or(z.literal("")),
  ciudad: z.string().trim().max(80).or(z.literal("")),
})

export const cambiarPasswordSchema = z.object({
  actual: z.string().min(1, "Ingresa tu contrasena actual"),
  nueva: passwordSchema,
})

export const restablecerSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})
