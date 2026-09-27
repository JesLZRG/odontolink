import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Footer } from "@/components/ui/Footer"

export const metadata = {
  title: "Politica de Privacidad",
}

export default function PrivacidadPage() {
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

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Politica de Privacidad</h1>
        <p className="text-sm text-slate-400 mb-8">Ultima actualizacion: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="flex flex-col gap-5 text-slate-600 leading-relaxed">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            <strong>Aviso importante:</strong> OdontoLink es un proyecto academico / demo con fines educativos.
            No es un servicio medico real ni una plataforma comercial. Las clinicas, doctores, citas y datos de
            pacientes que se muestran son de prueba y no corresponden a personas o negocios reales.
          </div>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Que datos recopilamos</h2>
            <p>
              Como parte de la demostracion, esta plataforma puede almacenar temporalmente datos que el usuario
              ingresa voluntariamente: nombre, correo electronico, telefono, y datos relacionados con citas
              dentales (fecha, especialidad, notas). Esta informacion se usa unicamente para hacer funcionar
              las caracteristicas de la demo (agenda, panel de doctor/clinica, historial de citas).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Como usamos los datos</h2>
            <p>
              No se utilizan los datos ingresados para fines comerciales, publicitarios ni se comparten con
              terceros. Al ser un entorno de prueba, los datos pueden reiniciarse o eliminarse en cualquier
              momento sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Cuentas y autenticacion</h2>
            <p>
              Las cuentas de paciente, clinica y doctor creadas en esta demo usan contrasenas cifradas, pero no
              se recomienda utilizar contrasenas reales que uses en otros servicios ni informacion personal
              sensible real.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Cookies y sesion</h2>
            <p>
              Usamos una cookie de sesion estrictamente necesaria para mantener tu inicio de sesion mientras
              navegas la plataforma. No usamos cookies de rastreo ni analitica de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Eliminacion de datos</h2>
            <p>
              Puedes eliminar tu cuenta de prueba desde la seccion "Mi cuenta" del panel. Al hacerlo, se elimina
              tu perfil y la informacion asociada creada durante la demo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Contacto</h2>
            <p>
              Si tienes preguntas sobre este proyecto, puedes escribir a{" "}
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
