import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "glass-light" | "glass-dark"
  hover?: boolean
}

export function Card({ className, variant = "light", hover = false, children, ...props }: CardProps) {
  const variants = {
    light: "bg-white border border-slate-200/80 shadow-sm",
    dark: "bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)]",
    "glass-light": "glass-light",
    "glass-dark": "glass-dark",
  }

  return (
    <div
      className={cn(
        "rounded-2xl",
        variants[variant],
        hover && "card-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-3", className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-3", className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
}
