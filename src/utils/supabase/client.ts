import { createBrowserClient } from '@supabase/ssr'

// Ce client est utilisé uniquement dans les composants 'use client' 
// pour écouter les changements en temps réel (WebSockets).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}