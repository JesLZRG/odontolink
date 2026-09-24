import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Cliente de Supabase para uso exclusivo del servidor (API routes).
// Usa la service role key, que se salta RLS: nunca debe llegar al navegador,
// por eso este archivo no tiene "use client" y solo se importa desde codigo de servidor.

let client: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient {
  if (client) return client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "Faltan las variables de entorno SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY. " +
        "Configuralas en .env.local (ver .env.example) y en Vercel."
    )
  }

  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}
