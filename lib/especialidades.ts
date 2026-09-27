import type { Especialidad } from "@/types"

// Unica fuente de verdad para las claves de especialidad: las mismas que se
// usan como filtro en el directorio (ver components/directory/FilterSidebar.tsx
// y ESPECIALIDAD_LABELS en lib/utils.ts). Reutilizarlas evita que un doctor
// quede con una especialidad que no coincide con ningun filtro/busqueda.
export const ESPECIALIDADES = [
  "ortodoncia",
  "implantes",
  "estetica",
  "endodoncia",
  "cirugia",
  "pediatrica",
  "periodoncia",
  "general",
] as const satisfies readonly Especialidad[]
