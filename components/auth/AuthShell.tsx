import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface AuthShellProps {
  titulo: string
  subtitulo: string
  children: React.ReactNode
}

// Contenedor centrado para las pantallas secundarias de autenticacion
export function AuthShell({ titulo, subtitulo, children }: AuthShellProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <Link href="/login" className="flex items-center gap-2.5 mb-6">
          <Image src="/logo.png" alt="OdontoLink" width={36} height={36} className="object-contain" />
          <span className="text-lg font-bold gradient-brand-text">OdontoLink</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        <p className="text-slate-500 text-sm mt-1 mb-6">{subtitulo}</p>
        {children}
        <Link
          href="/login"
          className="mt-6 text-sm text-slate-500 hover:text-[var(--color-primary)] inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a iniciar sesion
        </Link>
      </div>
    </main>
  )
}
