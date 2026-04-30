import { createClient } from '@supabase/supabase-js'

// Ce client spécial contourne les règles de sécurité RLS.
// IL NE DOIT ÊTRE UTILISÉ QUE CÔTÉ SERVEUR (Server Actions / Server Components).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)