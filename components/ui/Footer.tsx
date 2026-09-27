import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          <p className="font-bold gradient-brand-text text-lg">OdontoLink</p>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">
            Proyecto academico / demo. Los datos de clinicas, doctores y citas mostrados son de prueba.
          </p>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-slate-500">
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
            Tijuana, Baja California, Mexico
          </li>
          <li>
            <a href="tel:+526641234567" className="flex items-center gap-2 hover:text-[var(--color-primary)] transition-colors">
              <Phone className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
              +52 664 123 4567
            </a>
          </li>
          <li>
            <a href="mailto:contacto@odontolink.demo" className="flex items-center gap-2 hover:text-[var(--color-primary)] transition-colors">
              <Mail className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
              contacto@odontolink.demo
            </a>
          </li>
        </ul>

        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <Link href="/privacidad" className="text-slate-500 hover:text-[var(--color-primary)] transition-colors">
              Politica de Privacidad
            </Link>
          </li>
          <li>
            <Link href="/terminos" className="text-slate-500 hover:text-[var(--color-primary)] transition-colors">
              Terminos y Condiciones
            </Link>
          </li>
        </ul>
      </div>

      <div className="border-t border-slate-100 py-4 px-4 sm:px-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} OdontoLink. Proyecto educativo, no es un servicio medico real.
      </div>
    </footer>
  )
}
