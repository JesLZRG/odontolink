import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token"

// Proteccion de rutas. Verifica firma y expiracion de la cookie de sesion;
// la validacion completa (usuario existente, version de sesion) ocurre en getCurrentUser().

const SOLO_CLINICA = ["/dashboard", "/agenda", "/api/dashboard", "/api/agenda"]
const REQUIERE_SESION = [...SOLO_CLINICA, "/cuenta"]
const SOLO_INVITADOS = ["/login", "/recuperar", "/restablecer"]

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  const isApi = pathname.startsWith("/api/")

  if (matches(pathname, REQUIERE_SESION) && !session) {
    if (isApi) return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    const login = new URL("/login", request.url)
    login.searchParams.set("next", pathname + search)
    return NextResponse.redirect(login)
  }

  if (session && matches(pathname, SOLO_CLINICA) && session.rol !== "clinica") {
    if (isApi) return NextResponse.json({ success: false, message: "Acceso solo para clinicas" }, { status: 403 })
    return NextResponse.redirect(new URL("/directorio", request.url))
  }

  if (session && matches(pathname, SOLO_INVITADOS)) {
    return NextResponse.redirect(new URL(session.rol === "clinica" ? "/dashboard" : "/directorio", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/agenda/:path*",
    "/cuenta/:path*",
    "/login",
    "/recuperar",
    "/restablecer",
    "/api/dashboard/:path*",
    "/api/agenda/:path*",
  ],
}
