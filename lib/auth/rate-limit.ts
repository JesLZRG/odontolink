// Limitador en memoria (por instancia del servidor) para frenar fuerza bruta
const intentos = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, max: number, ventanaMs: number): boolean {
  const now = Date.now()
  const entry = intentos.get(key)
  if (!entry || entry.resetAt < now) {
    intentos.set(key, { count: 1, resetAt: now + ventanaMs })
    return true
  }
  entry.count++
  return entry.count <= max
}

export function resetRateLimit(key: string) {
  intentos.delete(key)
}
