"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, CalendarDays, Users, FolderOpen,
  MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { logout, useSession } from "@/components/auth/useSession"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/dashboard/agenda", icon: CalendarDays, label: "Agenda" },
  { href: "/dashboard/pacientes", icon: Users, label: "Pacientes" },
  { href: "/dashboard/expedientes", icon: FolderOpen, label: "Expedientes" },
  { href: "/dashboard/mensajes", icon: MessageSquare, label: "Mensajes", badge: 5 },
  { href: "/dashboard/configuracion", icon: Settings, label: "Configuracion" },
]

import Image from "next/image"

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useSession()

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[var(--color-bg-dark)] border-r border-[var(--color-border-dark)] transition-all duration-300 ease-in-out flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 border-b border-[var(--color-border-dark)] px-4", collapsed ? "justify-center" : "gap-3")}>
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 drop-shadow-sm">
          <Image src="/logo.png" alt="OdontoLink" width={36} height={36} className="object-contain" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-white font-bold text-sm block leading-tight whitespace-nowrap">OdontoLink</span>
            <span className="text-[var(--color-text-subtle)] text-xs leading-tight whitespace-nowrap">Panel Clinico</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20"
                    : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn("relative flex-shrink-0", isActive && "text-[var(--color-primary-light)]")}>
                  <Icon className={cn("h-5 w-5", isActive ? "text-[var(--color-primary-light)]" : "")} />
                  {badge && !collapsed && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-primary)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                {!collapsed && <span className="flex-1 truncate">{label}</span>}
                {!collapsed && badge && (
                  <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] text-xs font-medium px-1.5 py-0.5 rounded-md">
                    {badge}
                  </span>
                )}
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[var(--color-primary)] -ml-2" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border-dark)] p-3">
        {/* User avatar */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <Link href="/cuenta" className="flex items-center gap-3 flex-1 min-w-0 group" title="Mi cuenta">
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user ? getInitials(user.nombre) : ""}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-[var(--color-primary-light)] transition-colors">{user?.nombre ?? "..."}</p>
                <p className="text-[var(--color-text-subtle)] text-xs truncate">Mi cuenta</p>
              </div>
            </Link>
            <Bell className="h-4 w-4 text-[var(--color-text-subtle)] hover:text-white cursor-pointer flex-shrink-0" />
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[var(--color-text-subtle)] hover:text-white hover:bg-white/5 transition-all text-sm",
            collapsed ? "" : ""
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Colapsar</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--color-text-subtle)] hover:text-red-400 hover:bg-red-500/10 transition-all text-sm mt-1",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Cerrar sesion</span>}
        </button>
      </div>
    </aside>
  )
}
