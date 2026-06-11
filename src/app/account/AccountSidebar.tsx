'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClientBadges } from '@/hooks/useBadges'

interface AccountSidebarProps {
  userId: string | null
  hasShop: boolean
}

export default function AccountSidebar({ userId, hasShop }: AccountSidebarProps) {
  const pathname = usePathname()
  const { orderUpdates, clearOrderUpdates } = useClientBadges(userId)

  // Si on est sur /account ou /account/messages, on peut "consommer" les notifs
  const isOnOrdersPage = pathname === '/account'
  // (On garde le badge affiché tant qu'il y a des notifs et qu'on n'est pas sur la page)

  return (
    <div className="bg-gray-50 border-2 border-black sticky top-24 p-4 space-y-2">
      {hasShop && (
        <div className="mb-6">
          <Link
            href="/seller/dashboard"
            className="block w-full text-center px-4 py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors border border-black"
          >
            ⚙️ Espace Vendeur
          </Link>
        </div>
      )}

      <nav className="flex flex-col space-y-1">
        <Link
          href="/account"
          onClick={() => clearOrderUpdates()}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-between ${
            pathname === '/account' ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'
          }`}
        >
          <span>Mes commandes</span>
          {orderUpdates > 0 && !isOnOrdersPage && (
            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 border border-red-600 animate-pulse">
              {orderUpdates}
            </span>
          )}
        </Link>
        <Link
          href="/account/messages"
          className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
            pathname?.startsWith('/account/messages') ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'
          }`}
        >
          Mes messages
        </Link>
        <Link
          href="/account/favorites"
          className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
            pathname === '/account/favorites' ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'
          }`}
        >
          Mes favoris
        </Link>
        <Link
          href="/track"
          className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 transition-colors mt-2"
        >
          Suivi rapide
        </Link>
      </nav>

      <div className="border-t border-gray-300 my-4" />

      <form action="/auth/signout" method="POST">
        <button type="submit" className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors">
          Déconnexion
        </button>
      </form>
    </div>
  )
}
