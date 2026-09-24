"use client"

import { useCallback, useEffect, useState } from "react"
import type { Usuario } from "@/types"

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" })
  window.location.href = "/login"
}

// Usuario de la sesion actual. Si la cookie ya no es valida (p. ej. se cambio
// la contrasena en otro dispositivo) cierra la sesion y regresa al login.
export function useSession({ required = true }: { required?: boolean } = {}) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cuenta")
      if (res.status === 401) {
        setUser(null)
        if (required) await logout()
        return
      }
      const json = await res.json()
      if (json.success) setUser(json.data)
    } finally {
      setLoading(false)
    }
  }, [required])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { user, setUser, loading, refresh }
}
