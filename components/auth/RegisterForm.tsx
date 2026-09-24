"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Building2, Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { passwordSchema } from "@/lib/auth/schemas"
import type { UserRole } from "@/types"

const baseSchema = z.object({
  email: z.string().email("Ingresa un correo valido"),
  password: passwordSchema,
  telefono: z.string().min(10, "Telefono invalido"),
})

const pacienteSchema = baseSchema.extend({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
})

const clinicaSchema = baseSchema.extend({
  nombreClinica: z.string().min(3, "Ingresa el nombre de la clinica"),
  ciudad: z.string().min(2, "Ingresa la ciudad"),
})

type RegisterValues = z.infer<typeof baseSchema> & {
  nombre?: string
  nombreClinica?: string
  ciudad?: string
}

interface RegisterFormProps {
  role: UserRole
}

export function RegisterForm({ role }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(role === "clinica" ? clinicaSchema : pacienteSchema),
  })

  async function onSubmit(data: RegisterValues) {
    setServerError(null)
    try {
      const body = {
        nombre: role === "clinica" ? data.nombreClinica : data.nombre,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        ciudad: role === "clinica" ? data.ciudad : undefined,
        rol: role,
      }

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
      router.replace(json.data.redirectTo)
      router.refresh()
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
          autoComplete="name"
          placeholder="Ana Torres"
          icon={<User className="h-4 w-4" />}
          error={errors.nombre?.message}
          {...register("nombre")}
        />
      )}

      {role === "clinica" && (
        <>
          <Input
            label="Nombre de la clinica"
            type="text"
            autoComplete="organization"
            placeholder="Sonrisa Perfecta Dental"
            icon={<Building2 className="h-4 w-4" />}
            error={errors.nombreClinica?.message}
            {...register("nombreClinica")}
          />
          <Input
            label="Ciudad"
            type="text"
            placeholder="Tijuana, B.C."
            icon={<MapPin className="h-4 w-4" />}
            error={errors.ciudad?.message}
            {...register("ciudad")}
          />
        </>
      )}

      <Input
        label="Correo electronico"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Telefono"
        type="tel"
        autoComplete="tel"
        placeholder="+52 664 123 4567"
        icon={<Phone className="h-4 w-4" />}
        error={errors.telefono?.message}
        {...register("telefono")}
      />

      <Input
        label="Contrasena"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Min. 8 caracteres, 1 mayuscula, 1 numero"
        icon={<Lock className="h-4 w-4" />}
        iconRight={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-slate-600 transition-colors"
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
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
