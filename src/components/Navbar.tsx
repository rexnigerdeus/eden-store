import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import CartIcon from './CartIcon'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  let unreadCount = 0

  // Si l'utilisateur est connecté, on récupère ses infos et ses messages non lus
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data

    // 1. Récupérer les ID des conversations du client
    const { data: convs } = await supabase.from('conversations').select('id').eq('customer_id', user.id)
    const convIds = convs?.map((c) => c.id) || []

    // 2. Compter les messages non lus dans ces conversations
    if (convIds.length > 0) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .eq('is_read', false)
        .neq('sender_id', user.id) // On ne compte que les messages reçus
      
      unreadCount = count || 0
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl md:text-3xl font-bold text-walmart-blue tracking-tight">ASIM</span>
          </Link>

          {/* Barre de recherche globale (Boutiques ou Produits) */}
          <div className="flex-1 max-w-2xl hidden md:flex mx-8">
            <div className="relative w-full shadow-sm rounded-full">
              <input 
                type="text" 
                placeholder="Rechercher un produit, une catégorie..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-5 pr-10 focus:bg-white focus:border-walmart-blue focus:ring-2 focus:ring-walmart-blue outline-none transition-all"
              />
              <span className="absolute right-4 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Liens de droite */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/track" className="text-gray-600 hover:text-walmart-blue font-medium hidden md:flex items-center gap-2 transition-colors">
              <span>📦</span> Suivre ma commande
            </Link>

            {/* 🛒 NOTRE NOUVEAU COMPOSANT PANIER */}
            <CartIcon />

            {user ? (
              <div className="flex items-center gap-4">
                
                {/* 🔴 L'ICÔNE MESSAGES AVEC SA PASTILLE GLOBALE 🔴 */}
                <Link href="/account/messages" className="relative text-gray-600 hover:text-walmart-blue transition-colors p-1 flex items-center justify-center">
                  <span className="text-xl">💬</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Lien Compte / Prénom */}
                <Link href="/account" className="text-walmart-darkBlue font-semibold hidden lg:block hover:text-walmart-blue hover:underline transition-colors border-l border-gray-200 pl-4">
                  Bonjour, {profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || 'Client'}
                </Link>

                {/* Déconnexion */}
                <form action="/auth/signout" method="post">
                  <button type="submit" className="text-red-500 hover:text-red-700 font-medium transition-colors text-sm">
                    Déconnexion
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="text-white bg-walmart-blue px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                Connexion
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}