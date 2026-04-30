import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  // On prépare la réponse que le middleware va renvoyer
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // On crée un client Supabase spécial pour le middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // On récupère l'utilisateur actuel (s'il y en a un)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- NOTRE RÈGLE DE SÉCURITÉ ---
  // Si l'utilisateur essaie d'accéder au dashboard vendeur sans être connecté
  if (request.nextUrl.pathname.startsWith('/seller/dashboard')) {
    if (!user) {
      // Le "videur" le renvoie vers la page de connexion
      return NextResponse.redirect(new URL('/seller/login', request.url))
    }
  }

  // Sinon, on le laisse passer
  return supabaseResponse
}

// Configuration pour dire à Next.js sur quels fichiers le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}