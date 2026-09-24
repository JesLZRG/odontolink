"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const schema = z.object({ email: z.string().email("Ingresa un correo valido") })
type Values = z.infer<typeof schema>

export default function RecuperarPage() {
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  async function onSubmit(data: Values) {
    setMensaje(null)
    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      setMensaje({ ok: json.success, texto: json.message })
    } catch {
      setMensaje({ ok: false, texto: "Error de conexion. Intenta de nuevo." })
    }
  }

  return (
    <AuthShell
      titulo="Recupera tu contrasena"
      subtitulo="Te enviaremos un enlace a tu correo para crear una nueva contrasena."
    >
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
        {mensaje && (
          <div
            className={`rounded-xl p-3 text-sm border ${
              mensaje.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {mensaje.texto}
          </div>
        )}
        <Button type="submit" variant="glow" size="lg" loading={isSubmitting} className="w-full">
          {isSubmitting ? "Enviando..." : "Enviar enlace"}
        </Button>
      </form>
    </AuthShell>
  )
}
