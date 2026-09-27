import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Footer } from "@/components/ui/Footer"

export const metadata = {
  title: "Terminos y Condiciones",
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2.5">
          <Link href="/directorio" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="OdontoLink" width={32} height={32} className="object-contain" />
            <span className="font-bold gradient-brand-text">OdontoLink</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[var(--color-primary)] transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Terminos y Condiciones</h1>
        <p className="text-sm text-slate-400 mb-8">Ultima actualizacion: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="flex flex-col gap-5 text-slate-600 leading-relaxed">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            <strong>Aviso importante:</strong> OdontoLink es un proyecto academico desarrollado con fines
            educativos y de demostracion. No ofrece servicios medicos reales, no agenda citas con clinicas
            verdaderas y no debe usarse para tomar decisiones de salud reales.
          </div>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Aceptacion de los terminos</h2>
            <p>
              Al usar esta plataforma de demostracion aceptas que se trata de un entorno de prueba, sin
              garantias de disponibilidad, exactitud de la informacion ni continuidad del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Naturaleza de la informacion</h2>
            <p>
              Las clinicas, doctores, especialidades, horarios, calificaciones y citas mostradas son datos de
              prueba generados para fines de demostracion. Ninguno representa un negocio, profesional de la
              salud o cita real.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Uso permitido</h2>
            <p>
              Puedes crear cuentas y usar las funciones de la plataforma (directorio, agenda, panel de clinica
              o doctor) unicamente con fines de evaluacion y aprendizaje. No esta permitido usar la plataforma
              para publicar informacion real de pacientes, hacerte pasar por una clinica real, o cualquier uso
              con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Limitacion de responsabilidad</h2>
            <p>
              El equipo detras de este proyecto no se hace responsable por decisiones tomadas con base en la
              informacion mostrada en esta demo, ya que ninguna clinica, doctor o cita es real.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Cambios a estos terminos</h2>
            <p>
              Estos terminos pueden actualizarse en cualquier momento conforme evoluciona el proyecto academico.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Contacto</h2>
            <p>
              Para dudas sobre este proyecto, escribe a{" "}
              <a href="mailto:contacto@odontolink.demo" className="text-[var(--color-primary)] hover:underline">
                contacto@odontolink.demo
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
