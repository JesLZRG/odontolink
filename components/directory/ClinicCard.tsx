import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Globe, Star, CheckCircle2, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ESPECIALIDAD_LABELS, ASEGURADORA_LABELS } from "@/lib/utils"
import type { Clinica } from "@/types"

interface ClinicCardProps {
  clinica: Clinica
  featured?: boolean
}

export function ClinicCard({ clinica, featured = false }: ClinicCardProps) {
  const esBilingue = clinica.idiomas.includes("en") && clinica.idiomas.includes("es")

  return (
    <Card
      hover
      variant="light"
      className={`overflow-hidden group transition-all duration-300 ${
        featured ? "ring-2 ring-[var(--color-primary)]/30" : ""
      }`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <Image
          src={clinica.imagen}
          alt={clinica.nombre}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Plan badge */}
        {clinica.planSuscripcion === "premium" && (
          <div className="absolute top-3 left-3">
            <Badge variant="primary" className="bg-[var(--color-primary)] text-white border-0 shadow">
              <Star className="h-3 w-3 fill-current" />
              Destacada
            </Badge>
          </div>
        )}

        {/* Rating bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span className="text-white text-sm font-bold">{clinica.rating}</span>
          <span className="text-white/70 text-xs">({clinica.totalResenas})</span>
        </div>

        {/* Verified badge bottom-right */}
        {clinica.verificada && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white rounded-lg px-2 py-1">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-xs font-medium">Verificada</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        {/* Name */}
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-1 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
          {clinica.nombre}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-primary)]" />
          <span className="truncate">{clinica.direccion}, {clinica.ciudad}</span>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-2">
          {clinica.descripcion}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {esBilingue && (
            <Badge variant="primary">
              <Globe className="h-3 w-3" />
              Bilingue
            </Badge>
          )}
          {clinica.especialidades.slice(0, 2).map((esp) => (
            <Badge key={esp} variant="outline">
              {ESPECIALIDAD_LABELS[esp]}
            </Badge>
          ))}
          {clinica.especialidades.length > 2 && (
            <Badge variant="ghost">+{clinica.especialidades.length - 2}</Badge>
          )}
        </div>

        {/* Insurance */}
        {clinica.aseguradoras.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-1.5 font-medium">Aseguradoras:</p>
            <div className="flex flex-wrap gap-1">
              {clinica.aseguradoras.slice(0, 3).map((aseg) => (
                <span
                  key={aseg}
                  className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                >
                  {ASEGURADORA_LABELS[aseg]}
                </span>
              ))}
              {clinica.aseguradoras.length > 3 && (
                <span className="text-xs text-slate-400">+{clinica.aseguradoras.length - 3} mas</span>
              )}
            </div>
          </div>
        )}

        {/* Contact & CTA */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <a
            href={`tel:${clinica.telefono}`}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[var(--color-primary)] transition-colors flex-1 min-w-0"
          >
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{clinica.telefono}</span>
          </a>
          <Link href={`/directorio/${clinica.slug}`}>
            <Button variant="glow" size="sm" className="flex-shrink-0 gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Agendar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
