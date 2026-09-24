"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Lock } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { passwordSchema } from "@/lib/auth/schemas"

const schema = z
  .object({ password: passwordSchema, confirmar: z.string() })
  .refine((v) => v.password === v.confirmar, { message: "Las contrasenas no coinciden", path: ["confirmar"] })
type Values = z.infer<typeof schema>

function RestablecerForm() {
  const token = useSearchParams().get("token")
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
        El enlace no es valido.{" "}
        <Link href="/recuperar" className="font-medium underline">Solicita uno nuevo</Link>.
      </div>
    )
  }

  async function onSubmit(data: Values) {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/restablecer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      })
      const json = await res.json()
      if (!json.success) {
        setServerError(json.message)
        return
      }
      router.replace("/login?restablecida=1")
    } catch {
      setServerError("Error de conexion. Intenta de nuevo.")
    }
  }

  const toggle = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="hover:text-slate-600 transition-colors"
      aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Nueva contrasena"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Min. 8 caracteres, 1 mayuscula, 1 numero"
        icon={<Lock className="h-4 w-4" />}
        iconRight={toggle}
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Confirmar contrasena"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.confirmar?.message}
        {...register("confirmar")}
      />
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {serverError}{" "}
          <Link href="/recuperar" className="font-medium underline">Solicitar nuevo enlace</Link>
        </div>
      )}
      <Button type="submit" variant="glow" size="lg" loading={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : "Guardar contrasena"}
      </Button>
    </form>
  )
}

export default function RestablecerPage() {
  return (
    <AuthShell titulo="Crea una nueva contrasena" subtitulo="Por seguridad se cerrara la sesion en todos tus dispositivos.">
      <Suspense>
        <RestablecerForm />
      </Suspense>
    </AuthShell>
  )
}
