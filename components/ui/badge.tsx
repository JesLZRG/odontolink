import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md"
}

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
    primary: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30",
    secondary: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    outline: "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400",
    ghost: "bg-transparent text-slate-500 dark:text-slate-400",
  }
  const sizes = {
    sm: "text-xs px-2 py-0.5 rounded-md",
    md: "text-xs px-2.5 py-1 rounded-lg",
  }

  return (
    <span className={cn("inline-flex items-center gap-1 font-medium", variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  )
}
