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

export const registroSchema = z
  .object({
    nombre: z.string().trim().min(2, "Ingresa tu nombre completo").max(120),
    email: emailSchema,
    password: passwordSchema,
    telefono: z.string().trim().min(10, "Telefono invalido").max(20),
    ciudad: z.string().trim().max(80).optional(),
    rol: z.enum(["paciente", "clinica"]),
    direccion: z.string().trim().max(200).optional(),
    descripcion: z.string().trim().max(600).optional(),
    imagen: z.string().trim().url("Ingresa una URL de imagen valida").max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rol !== "clinica") return
    if (!data.ciudad) ctx.addIssue({ code: "custom", path: ["ciudad"], message: "Ingresa la ciudad" })
    if (!data.direccion) ctx.addIssue({ code: "custom", path: ["direccion"], message: "Ingresa la direccion" })
    if (!data.descripcion) ctx.addIssue({ code: "custom", path: ["descripcion"], message: "Describe brevemente tu clinica" })
    if (!data.imagen) ctx.addIssue({ code: "custom", path: ["imagen"], message: "Ingresa la URL de una imagen" })
  })

export const crearDoctorSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre completo").max(120),
  email: emailSchema,
  password: passwordSchema,
  especialidad: z.string().trim().min(2, "Ingresa la especialidad").max(60),
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
