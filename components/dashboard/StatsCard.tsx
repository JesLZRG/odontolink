import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: "primary" | "secondary" | "warning" | "purple"
}

const COLOR_MAP = {
  primary: {
    icon: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    trend: "text-cyan-400",
    glow: "shadow-cyan-500/10",
  },
  secondary: {
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    trend: "text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  warning: {
    icon: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    trend: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  purple: {
    icon: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    trend: "text-violet-400",
    glow: "shadow-violet-500/10",
  },
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "primary" }: StatsCardProps) {
  const colors = COLOR_MAP[color]

  return (
    <div
      className={cn(
        "bg-[var(--color-surface-dark)] rounded-2xl p-5 border border-[var(--color-border-dark)] hover:border-[var(--color-primary)]/30 transition-all duration-200 shadow-lg",
        colors.glow
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[var(--color-text-subtle)] text-xs font-medium uppercase tracking-wide truncate">{title}</p>
          <p className="text-3xl font-bold text-white mt-1 tabular-nums">{value}</p>
          {subtitle && <p className="text-[var(--color-text-subtle)] text-xs mt-0.5 whitespace-nowrap">{subtitle}</p>}
        </div>
        <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold flex-shrink-0",
              trend.value >= 0 ? "text-emerald-400" : "text-red-400"
            )}
          >
            <svg className={cn("h-3 w-3 flex-shrink-0", trend.value < 0 && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(trend.value)}%
          </div>
          <span className="text-[var(--color-text-subtle)] text-xs truncate">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
