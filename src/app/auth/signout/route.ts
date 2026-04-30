import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // On vérifie s'il y a une session active
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // On détruit la session (efface les cookies)
    await supabase.auth.signOut()
  }

  // On redirige vers la page d'accueil
  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  })
}