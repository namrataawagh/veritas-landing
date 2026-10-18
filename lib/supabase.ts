import { createClient } from "@supabase/supabase-js"

// Public project values: the publishable (anon) key is safe in the browser; row-level
// security in supabase/migrations decides what each signed-in user can read or write.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://pbdzggynnwyirupypiro.supabase.co"
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZHpnZ3lubnd5aXJ1cHlwaXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMTc4NDgsImV4cCI6MjEwNzg5Mzg0OH0.tT9x3bFAT6PBtt0-nVPEzRzmAVCOHeydxzm0WAGPC4Q"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true },
})
