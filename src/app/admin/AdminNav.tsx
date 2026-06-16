'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminBadges } from '@/hooks/useBadges'

export default function AdminNav({ onLinkClick }: { onLinkClick?: () => void } = {}) {
  const pathname = usePathname()

  // On écoute les boutiques en attente de validation
  const { pendingShops, unreadSupportTickets } = useAdminBadges()

  const links = [
    { name: "Vue d'ensemble", href: '/admin/dashboard' },
    { name: 'Catégories', href: '/admin/categories' },
    { name: 'Comptes utilisateurs', href: '/admin/users' },
    { name: 'Vendeurs', href: '/admin/shops' },
    { name: 'Abonnements', href: '/admin/subscriptions', badge: pendingShops },
    { name: 'Support Eden', href: '/admin/support', badge: unreadSupportTickets },
  ]

  return (
    <nav className="flex-1 space-y-1 px-4">
      {links.map((link) => {
        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin/dashboard')

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className={`flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-none ${
              isActive ? 'bg-white text-black' : 'text-gray-400 hover:bg-white hover:text-black'
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