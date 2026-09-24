"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, BadgeCheck, Building2, CalendarClock, Loader2, Lock, LogOut, MapPin, Phone, Trash2, User } from "lucide-react"
import { logout, useSession } from "@/components/auth/useSession"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cambiarPasswordSchema, perfilSchema } from "@/lib/auth/schemas"
import { getInitials } from "@/lib/utils"
import type { Usuario } from "@/types"

type Aviso = { ok: boolean; texto: string } | null

function AvisoBox({ aviso }: { aviso: Aviso }) {
  if (!aviso) return null
  return (
    <div
      className={`rounded-xl p-3 text-sm border ${
        aviso.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"
      }`}
    >
      {aviso.texto}
    </div>
  )
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
      <p className="text-sm text-slate-500 mt-0.5 mb-5">{descripcion}</p>
      {children}
    </section>
  )
}

async function enviarJson(url: string, method: string, body: unknown) {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    return await res.json()
  } catch {
    return { success: false, message: "Error de conexion. Intenta de nuevo." }
  }
}

// ---------- Perfil ----------

type PerfilValues = z.infer<typeof perfilSchema>

function PerfilForm({ user, onSaved }: { user: Usuario; onSaved: (u: Usuario) => void }) {
  const [aviso, setAviso] = useState<Aviso>(null)
  const esClinica = user.rol === "clinica"
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PerfilValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nombre: user.nombre, telefono: user.telefono ?? "", ciudad: user.ciudad ?? "" },
  })

  async function onSubmit(data: PerfilValues) {
    setAviso(null)
    const json = await enviarJson("/api/cuenta", "PATCH", data)
    setAviso({ ok: json.success, texto: json.message })
    if (json.success) {
      onSaved(json.data)
      reset(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label={esClinica ? "Nombre de la clinica" : "Nombre completo"}
          icon={esClinica ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
          error={errors.nombre?.message}
          {...register("nombre")}
        />
      </div>
      <Input label="Telefono" type="tel" icon={<Phone className="h-4 w-4" />} error={errors.telefono?.message} {...register("telefono")} />
      <Input label="Ciudad" icon={<MapPin className="h-4 w-4" />} error={errors.ciudad?.message} {...register("ciudad")} />
      <div className="sm:col-span-2 flex flex-col gap-3">
        <AvisoBox aviso={aviso} />
        <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="self-start">
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}

// ---------- Contrasena ----------

const passwordFormSchema = cambiarPasswordSchema
  .extend({ confirmar: z.string() })
  .refine((v) => v.nueva === v.confirmar, { message: "Las contrasenas no coinciden", path: ["confirmar"] })
type PasswordValues = z.infer<typeof passwordFormSchema>

function PasswordForm() {
  const [aviso, setAviso] = useState<Aviso>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordFormSchema) })

  async function onSubmit({ actual, nueva }: PasswordValues) {
    setAviso(null)
    const json = await enviarJson("/api/cuenta/password", "POST", { actual, nueva })
    setAviso({ ok: json.success, texto: json.message })
    if (json.success) reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label="Contrasena actual"
          type="password"
          autoComplete="current-password"
          icon={<Lock className="h-4 w-4" />}
          error={errors.actual?.message}
          {...register("actual")}
        />
      </div>
      <Input
        label="Nueva contrasena"
        type="password"
        autoComplete="new-password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.nueva?.message}
        {...register("nueva")}
      />
      <Input
        label="Confirmar nueva contrasena"
        type="password"
        autoComplete="new-password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.confirmar?.message}
        {...register("confirmar")}
      />
      <div className="sm:col-span-2 flex flex-col gap-3">
        <p className="text-xs text-slate-500">Al cambiarla se cerrara la sesion en tus otros dispositivos.</p>
        <AvisoBox aviso={aviso} />
        <Button type="submit" loading={isSubmitting} className="self-start">
          Cambiar contrasena
        </Button>
      </div>
    </form>
  )
}

// ---------- Eliminar cuenta ----------

function EliminarCuenta() {
  const [abierto, setAbierto] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function eliminar() {
    setEnviando(true)
    setError(null)
    const json = await enviarJson("/api/cuenta", "DELETE", { password })
    setEnviando(false)
    if (!json.success) {
      setError(json.message)
      return
    }
    window.location.href = "/login?eliminada=1"
  }

  if (!abierto) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setAbierto(true)}
        className="border-red-300 text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Eliminar mi cuenta
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <Input
        label="Confirma con tu contrasena"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error ?? undefined}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={eliminar}
          loading={enviando}
          disabled={!password}
          className="bg-red-600 hover:bg-red-700"
        >
          Eliminar definitivamente
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => { setAbierto(false); setPassword(""); setError(null) }}
          className="border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}

// ---------- Pagina ----------

export default function CuentaPage() {
  const { user, setUser, loading } = useSession()
  const [cerrando, setCerrando] = useState(false)

  useEffect(() => {
    document.title = "Mi cuenta | OdontoLink"
  }, [])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
      </div>
    )
  }

  const inicio = user.rol === "clinica" ? "/dashboard" : "/directorio"

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href={inicio} className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="OdontoLink" width={36} height={36} className="object-contain" />
            <span className="text-lg font-bold gradient-brand-text">OdontoLink</span>
          </Link>
          <button
            onClick={() => { setCerrando(true); logout() }}
            disabled={cerrando}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href={inicio}
            className="text-sm text-slate-500 hover:text-[var(--color-primary)] inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {user.rol === "clinica" ? "Volver al panel" : "Volver al directorio"}
          </Link>
          {user.rol === "paciente" && (
            <Link
              href="/mis-citas"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1.5"
            >
              <CalendarClock className="h-4 w-4" />
              Mis citas
            </Link>
          )}
        </div>

        {/* Resumen */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {getInitials(user.nombre)}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{user.nombre}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 flex-wrap">
              <span className="truncate">{user.email}</span>
              {user.emailVerificado && (
                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verificado
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Cuenta de {user.rol === "clinica" ? "clinica" : "paciente"} · Miembro desde{" "}
              {new Date(user.creadoEn).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <Seccion titulo="Perfil" descripcion="Tu informacion de contacto. El correo no se puede cambiar.">
          <PerfilForm user={user} onSaved={setUser} />
        </Seccion>

        <Seccion titulo="Contrasena" descripcion="Usa al menos 8 caracteres, una mayuscula y un numero.">
          <PasswordForm />
        </Seccion>

        <Seccion titulo="Eliminar cuenta" descripcion="Se borraran tu cuenta y tus datos de acceso. Esta accion no se puede deshacer.">
          <EliminarCuenta />
        </Seccion>
      </main>
    </div>
  )
}
