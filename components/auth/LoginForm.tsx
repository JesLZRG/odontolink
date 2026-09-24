"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { UserRole } from "@/types"

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo valido"),
  password: z.string().min(1, "Ingresa tu contrasena"),
  recordarme: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  role: UserRole
}

export function LoginForm({ role }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [resendMsg, setResendMsg] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", recordarme: true },
  })

  async function onSubmit(data: LoginValues) {
    setServerError(null)
    setPendingEmail(null)
    setResendMsg(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, rol: role, next: searchParams.get("next") }),
      })
      const json = await res.json()
      if (!json.success) {
        setServerError(json.message ?? "Error al iniciar sesion")
        if (json.code === "EMAIL_NO_VERIFICADO") setPendingEmail(data.email)
        return
      }
      router.replace(json.data.redirectTo)
      router.refresh()
    } catch {
      setServerError("Error de conexion. Intenta de nuevo.")
    }
  }

  async function resendVerification() {
    if (!pendingEmail) return
    setResending(true)
    try {
      const res = await fetch("/api/auth/reenviar-verificacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      })
      const json = await res.json()
      setResendMsg(json.message)
    } catch {
      setResendMsg("Error de conexion. Intenta de nuevo.")
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
        label="Contrasena"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
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
          {pendingEmail && !resendMsg && (
            <button
              type="button"
              onClick={resendVerification}
              disabled={resending}
              className="block mt-1.5 font-medium text-[var(--color-primary)] hover:underline disabled:opacity-60"
            >
              {resending ? "Enviando..." : "Reenviar correo de confirmacion"}
            </button>
          )}
          {resendMsg && <p className="mt-1.5 text-slate-600">{resendMsg}</p>}
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            {...register("recordarme")}
          />
          Recordarme
        </label>
        <Link href="/recuperar" className="text-sm text-[var(--color-primary)] hover:underline font-medium">
          Olvide mi contrasena
        </Link>
      </div>

      <Button
        type="submit"
        variant="glow"
        size="lg"
        loading={isSubmitting}
        className="w-full mt-2"
      >
        {isSubmitting ? "Iniciando sesion..." : "Iniciar Sesion"}
      </Button>

      <p className="text-xs text-center text-slate-500 bg-cyan-50 border border-cyan-100 rounded-lg p-2.5">
        Demo: <span className="font-mono font-medium">{role === "clinica" ? "clinica@demo.com" : "paciente@demo.com"}</span> / <span className="font-mono font-medium">Demo1234!</span>
      </p>
    </form>
  )
}
