'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSellerBadges } from '@/hooks/useBadges'

export default function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  
  const [userId, setUserId] = useState<string | null>(null)
  const [shopId, setShopId] = useState<string | null>(null)
  const supabase = createClient()

  // On récupère les identifiants nécessaires pour le Hook
  useEffect(() => {
    const fetchIds = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        const { data: shop } = await supabase.from('shops').select('id').eq('seller_id', session.user.id).single()
        if (shop) setShopId(shop.id)
      }
    }
    fetchIds()
  }, [supabase])

  // On active notre système de notification temps réel
  const { pendingOrders, unreadMessages } = useSellerBadges(shopId, userId)

  const links = [
    { name: 'Aperçu', href: '/seller/dashboard' },
    { name: 'Commandes', href: '/seller/dashboard/orders', badge: pendingOrders },
    { name: 'Messages', href: '/seller/dashboard/messages', badge: unreadMessages },
    { name: 'Mes Produits', href: '/seller/dashboard/products' },
    { name: 'Ma Boutique', href: '/seller/dashboard/settings' },
    { name: 'Abonnement', href: '/seller/dashboard/billing' },
    { name: 'Mon Profil', href: '/seller/dashboard/profile' },
  ]

  return (
    <nav className="flex-1 px-4 space-y-1.5 mt-6">
      {links.map((link) => {
        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/seller/dashboard')

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className={`flex items-center justify-between px-4 py-3 font-montserrat font-bold text-xs uppercase tracking-widest transition-colors rounded-none ${
              isActive
                ? 'bg-white text-black font-black' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>{link.name}</span>
            
            {/* BADGE BRUTALISTE */}
            {link.badge && link.badge > 0 ? (
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 border border-red-600 animate-pulse">
                {link.badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}