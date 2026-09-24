"use client"

import type { UserRole } from "@/types"
import { cn } from "@/lib/utils"
import { Building2, User } from "lucide-react"
import { motion } from "framer-motion"

interface RoleToggleProps {
  role: UserRole
  onChange: (role: UserRole) => void
}

export function RoleToggle({ role, onChange }: RoleToggleProps) {
  return (
    <div className="relative flex items-center bg-slate-100 rounded-xl p-1 w-full">
      {/* Sliding indicator */}
      <motion.div
        className="absolute h-[calc(100%-8px)] top-1 rounded-lg bg-white shadow-sm border border-slate-200"
        style={{ width: "calc(50% - 4px)" }}
        animate={{ x: role === "clinica" ? "calc(100% + 8px)" : "0%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      <button
        type="button"
        onClick={() => onChange("paciente")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
          role === "paciente"
            ? "text-slate-800"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <User className="h-4 w-4" />
        Paciente
      </button>

      <button
        type="button"
        onClick={() => onChange("clinica")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
          role === "clinica"
            ? "text-slate-800"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Building2 className="h-4 w-4" />
        Clinica
      </button>
    </div>
  )
}
