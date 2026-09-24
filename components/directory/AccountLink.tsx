"use client"

import Link from "next/link"
import { CalendarClock } from "lucide-react"
import { useSession } from "@/components/auth/useSession"
import { getInitials } from "@/lib/utils"

export function AccountLink() {
  const { user } = useSession({ required: false })

  if (user) {
    return (
      <div className="hidden sm:flex items-center gap-2">
        {user.rol === "paciente" && (
          <Link
            href="/mis-citas"
            title="Mis citas"
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:border-[var(--color-primary)] transition-colors"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Mis citas
          </Link>
        )}
        <Link
          href="/cuenta"
          title="Mi cuenta"
          className="inline-flex items-center gap-2 pl-1 pr-3 h-9 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:border-[var(--color-primary)] transition-colors"
        >
          <span className="w-7 h-7 rounded-lg gradient-brand text-white text-xs font-bold flex items-center justify-center">
            {getInitials(user.nombre)}
          </span>
          Mi cuenta
        </Link>
      </div>
    )
  }

  return (
    <Link
      href="/login"
      className="hidden sm:inline-flex items-center gap-1.5 px-4 h-9 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium hover:bg-cyan-50 transition-colors"
    >
      Iniciar sesion
    </Link>
  )
}
