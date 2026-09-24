"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { RoleToggle } from "@/components/auth/RoleToggle"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import type { UserRole } from "@/types"

type AuthTab = "login" | "registro"

import Image from "next/image"

// Icono de hada OdontoLink
function OdontoLinkLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 flex items-center justify-center drop-shadow-md">
          <Image src="/logo.png" alt="OdontoLink Logo" width={48} height={48} className="object-contain" priority />
        </div>
      </div>
      <div>
        <span className="text-xl font-bold gradient-brand-text">OdontoLink</span>
        <p className="text-xs text-slate-500 -mt-0.5 leading-none">El enlace para tu sonrisa</p>
      </div>
    </div>
  )
}

// Panel izquierdo: branding visual
function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-brand opacity-90" />

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "10%", left: "10%" }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-white/10 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ bottom: "15%", right: "10%" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col p-12 w-full h-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
            <Image src="/logo.png" alt="OdontoLink" width={54} height={54} className="object-contain" priority />
          </div>
          <div>
            <span className="text-2xl font-bold text-white tracking-tight">OdontoLink</span>
            <p className="text-xs text-white/70 -mt-0.5">El enlace para tu sonrisa</p>
          </div>
        </div>

        {/* Main copy */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4"
          >
            Tu sonrisa perfecta,{" "}
            <span className="text-white/80">a un clic de distancia</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/75 text-lg leading-relaxed max-w-md"
          >
            Conectamos pacientes de EE.UU. y Canada con las mejores
            clinicas dentales de la region fronteriza. Calidad premium
            con precios accesibles.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            {["Directorio verificado", "Agenda en linea", "Historial clinico", "Seguros internacionales"].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {f}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const AVISOS: Record<string, { tipo: "ok" | "error"; texto: string }> = {
  verificado: { tipo: "ok", texto: "Correo confirmado! Ya puedes iniciar sesion." },
  restablecida: { tipo: "ok", texto: "Contrasena actualizada. Inicia sesion con tu nueva contrasena." },
  eliminada: { tipo: "ok", texto: "Tu cuenta fue eliminada." },
  enlace_invalido: { tipo: "error", texto: "El enlace no es valido o ya expiro. Solicita uno nuevo." },
}

function AvisoUrl() {
  const params = useSearchParams()
  const clave = params.get("verificado")
    ? "verificado"
    : params.get("restablecida")
      ? "restablecida"
      : params.get("eliminada")
        ? "eliminada"
        : params.get("error")
  const aviso = clave ? AVISOS[clave] : undefined
  if (!aviso) return null
  return (
    <div
      className={`mb-5 rounded-xl p-3 text-sm border ${
        aviso.tipo === "ok"
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-red-50 border-red-200 text-red-600"
      }`}
    >
      {aviso.texto}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const [role, setRole] = useState<UserRole>("paciente")
  const [tab, setTab] = useState<AuthTab>("login")

  return (
    <main className="min-h-screen flex bg-white">
      <BrandPanel />

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <OdontoLinkLogo />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {tab === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {tab === "login"
                ? "Ingresa tus credenciales para continuar"
                : "Empieza gratis hoy mismo"}
            </p>
          </div>

          <AvisoUrl />

          {/* Role toggle */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Accedo como
            </p>
            <RoleToggle role={role} onChange={setRole} />
          </div>

          {/* Tab selector */}
          <div className="flex border-b border-slate-200 mb-6">
            {(["login", "registro"] as AuthTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 pb-3 text-sm font-medium capitalize transition-all duration-200 border-b-2 -mb-px ${
                  tab === t
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "login" ? "Iniciar sesion" : "Registrarse"}
              </button>
            ))}
          </div>

          {/* Form content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${role}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "login" ? (
                <LoginForm role={role} />
              ) : (
                <RegisterForm role={role} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-slate-200" />
            <span className="text-xs text-slate-400">o</span>
            <hr className="flex-1 border-slate-200" />
          </div>

          {/* Guest link */}
          <div className="text-center">
            <Link
              href="/directorio"
              className="text-sm text-[var(--color-primary)] hover:underline font-medium inline-flex items-center gap-1"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explorar directorio sin cuenta
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-8">
            &copy; {new Date().getFullYear()} OdontoLink. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </main>
  )
}
