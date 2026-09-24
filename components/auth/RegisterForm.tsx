"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Building2, Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { UserRole } from "@/types"

const pacienteSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().email("Ingresa un correo valido"),
  password: z
    .string()
    .min(8, "Minimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener una mayuscula")
    .regex(/[0-9]/, "Debe contener un numero"),
  telefono: z.string().min(10, "Telefono invalido"),
})

const clinicaSchema = pacienteSchema.extend({
  nombreClinica: z.string().min(3, "Ingresa el nombre de la clinica"),
  ciudad: z.string().min(2, "Ingresa la ciudad"),
})

type PacienteValues = z.infer<typeof pacienteSchema>
type ClinicaValues = z.infer<typeof clinicaSchema>

interface RegisterFormProps {
  role: UserRole
}

export function RegisterForm({ role }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const router = useRouter()

  const schema = role === "clinica" ? clinicaSchema : pacienteSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PacienteValues | ClinicaValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: PacienteValues | ClinicaValues) {
    setServerError(null)
    try {
      const body =
        role === "clinica"
          ? {
              nombre: (data as ClinicaValues).nombreClinica,
              email: data.email,
              password: data.password,
              telefono: data.telefono,
              ciudad: (data as ClinicaValues).ciudad,
              rol: role,
            }
          : { nombre: data.nombre, email: data.email, password: data.password, telefono: data.telefono, rol: role }

      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        setServerError(json.message ?? "Error al registrar")
        return
      }
      setSuccessMsg(json.data.message)
      setTimeout(() => router.push(json.data.redirectTo), 1500)
    } catch {
      setServerError("Error de conexion. Intenta de nuevo.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
      {role === "paciente" && (
        <Input
          label="Nombre completo"
          type="text"
          placeholder="Ana Torres"
          icon={<User className="h-4 w-4" />}
          error={(errors as Record<string, {message?: string}>).nombre?.message}
          {...register("nombre")}
        />
      )}

      {role === "clinica" && (
        <>
          <Input
            label="Nombre de la clinica"
            type="text"
            placeholder="Sonrisa Perfecta Dental"
            icon={<Building2 className="h-4 w-4" />}
            error={(errors as Record<string, {message?: string}>).nombreClinica?.message}
            {...register("nombreClinica" as keyof (PacienteValues | ClinicaValues))}
          />
          <Input
            label="Ciudad"
            type="text"
            placeholder="Tijuana, B.C."
            icon={<MapPin className="h-4 w-4" />}
            error={(errors as Record<string, {message?: string}>).ciudad?.message}
            {...register("ciudad" as keyof (PacienteValues | ClinicaValues))}
          />
        </>
      )}

      <Input
        label="Correo electronico"
        type="email"
        placeholder="tu@correo.com"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Telefono"
        type="tel"
        placeholder="+52 664 123 4567"
        icon={<Phone className="h-4 w-4" />}
        error={errors.telefono?.message}
        {...register("telefono")}
      />

      <Input
        label="Contrasena"
        type={showPassword ? "text" : "password"}
        placeholder="Min. 8 caracteres, 1 mayuscula, 1 numero"
        icon={<Lock className="h-4 w-4" />}
        iconRight={
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-slate-600 transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        error={errors.password?.message}
        {...register("password")}
      />

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Al registrarte aceptas nuestros{" "}
        <a href="#" className="text-[var(--color-primary)] hover:underline">Terminos de servicio</a> y{" "}
        <a href="#" className="text-[var(--color-primary)] hover:underline">Politica de privacidad</a>.
      </p>

      <Button
        type="submit"
        variant="glow"
        size="lg"
        loading={isSubmitting}
        className="w-full mt-1"
      >
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta gratis"}
      </Button>
    </form>
  )
}
