import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Globe,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react"
import { AccountLink } from "@/components/directory/AccountLink"
import { BookingForm } from "@/components/directory/BookingForm"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { findClinicaByIdOrSlug, listDoctoresByClinica } from "@/lib/clinicas/store"
import { ASEGURADORA_LABELS, ESPECIALIDAD_LABELS, IDIOMA_LABELS, getInitials } from "@/lib/utils"
import type { HorarioSemana } from "@/types"

const DIAS: { key: keyof HorarioSemana; label: string }[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miercoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sabado" },
  { key: "domingo", label: "Domingo" },
]

function Logo() {
  return (
    <Link href="/directorio" className="flex items-center gap-2.5 group">
      <div className="w-10 h-10 flex items-center justify-center drop-shadow-sm">
        <Image src="/logo.png" alt="OdontoLink" width={40} height={40} className="object-contain" />
      </div>
      <span className="text-lg font-bold gradient-brand-text group-hover:opacity-80 transition-opacity">OdontoLink</span>
    </Link>
  )
}

export default async function ClinicaDetallePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const clinica = await findClinicaByIdOrSlug(slug)
  if (!clinica) notFound()

  const doctores = await listDoctoresByClinica(clinica.id)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Logo />
          <AccountLink />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/directorio"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[var(--color-primary)] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al directorio
        </Link>

        {/* Hero */}
        <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden bg-slate-200 mb-6">
          <Image src={clinica.imagen} alt={clinica.nombre} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {clinica.planSuscripcion === "premium" && (
            <div className="absolute top-4 left-4">
              <Badge variant="primary" className="bg-[var(--color-primary)] text-white border-0 shadow">
                <Star className="h-3 w-3 fill-current" />
                Destacada
              </Badge>
            </div>
          )}
          {clinica.verificada && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white rounded-lg px-2.5 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Clinica verificada</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1.5">
            <h1 className="text-white text-2xl sm:text-3xl font-bold drop-shadow">{clinica.nombre}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/90 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {clinica.direccion}, {clinica.ciudad}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold">{clinica.rating}</span>
                <span className="text-white/70">({clinica.totalResenas} resenas)</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info principal */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Contacto rapido */}
            <Card variant="light">
              <CardContent className="p-5 flex flex-wrap gap-x-6 gap-y-3">
                <a href={`tel:${clinica.telefono}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-[var(--color-primary)] transition-colors">
                  <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                  {clinica.telefono}
                </a>
                {clinica.sitioWeb && (
                  <a href={clinica.sitioWeb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-600 hover:text-[var(--color-primary)] transition-colors">
                    <Globe className="h-4 w-4 text-[var(--color-primary)]" />
                    Sitio web
                  </a>
                )}
                <div className="flex items-center gap-1.5">
                  {clinica.idiomas.map((idioma) => (
                    <Badge key={idioma} variant="outline" size="sm">{IDIOMA_LABELS[idioma] ?? idioma}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Descripcion */}
            <Card variant="light">
              <CardContent className="p-5">
                <h2 className="font-bold text-slate-900 mb-2">Sobre la clinica</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{clinica.descripcion}</p>
              </CardContent>
            </Card>

            {/* Especialidades */}
            <Card variant="light">
              <CardContent className="p-5">
                <h2 className="font-bold text-slate-900 mb-3">Especialidades</h2>
                <div className="flex flex-wrap gap-2">
                  {clinica.especialidades.map((esp) => (
                    <Badge key={esp} variant="primary">{ESPECIALIDAD_LABELS[esp] ?? esp}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Aseguradoras */}
            {clinica.aseguradoras.length > 0 && (
              <Card variant="light">
                <CardContent className="p-5">
                  <h2 className="font-bold text-slate-900 mb-3">Aseguradoras aceptadas</h2>
                  <div className="flex flex-wrap gap-2">
                    {clinica.aseguradoras.map((aseg) => (
                      <span key={aseg} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg">
                        {ASEGURADORA_LABELS[aseg] ?? aseg}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Horario */}
            <Card variant="light">
              <CardContent className="p-5">
                <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                  Horario de atencion
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-1.5">
                  {DIAS.map(({ key, label }) => {
                    const horarioDia = clinica.horario[key]
                    return (
                      <div key={key} className="flex items-center justify-between text-sm border-b border-slate-50 last:border-0 py-1.5 sm:max-w-xs">
                        <span className="text-slate-500">{label}</span>
                        <span className={horarioDia ? "text-slate-700 font-medium" : "text-slate-300"}>
                          {horarioDia ? `${horarioDia.abre} - ${horarioDia.cierra}` : "Cerrado"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Doctores */}
            <Card variant="light">
              <CardContent className="p-5">
                <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-[var(--color-primary)]" />
                  Nuestros doctores
                </h2>
                {doctores.length === 0 ? (
                  <p className="text-sm text-slate-400">Todavia no hay doctores dados de alta.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctores.map((doctor) => (
                      <div key={doctor.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                        <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {getInitials(doctor.nombre)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{doctor.nombre}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <BadgeCheck className="h-3 w-3 text-[var(--color-primary)]" />
                            {ESPECIALIDAD_LABELS[doctor.especialidad] ?? doctor.especialidad}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Formulario de cita */}
          <div className="lg:col-span-1">
            <BookingForm clinica={{ id: clinica.id, horario: clinica.horario }} doctores={doctores} />
          </div>
        </div>
      </main>
    </div>
  )
}
