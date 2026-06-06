'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()

  const links = [
    { name: 'Aperçu', href: '/seller/dashboard' },
    { name: 'Commandes', href: '/seller/dashboard/orders' },
    { name: 'Messages', href: '/seller/dashboard/messages' },
    { name: 'Mes Produits', href: '/seller/dashboard/products' },
    { name: 'Ma Boutique', href: '/seller/dashboard/settings' },
    { name: 'Abonnement', href: '/seller/dashboard/billing' },
    { name: 'Mon Profil', href: '/seller/dashboard/profile' },
  ]

  return (
    <nav className="flex-1 px-4 space-y-1.5 mt-6">
      {links.map((link) => {
        const isActive = 
          pathname === link.href || 
          (pathname.startsWith(link.href) && link.href !== '/seller/dashboard')

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className={`block px-4 py-3 font-montserrat font-bold text-xs uppercase tracking-widest transition-colors rounded-none ${
              isActive
                ? 'bg-white text-black font-black' // Lien actif : fond blanc, écriture noire
                : 'text-gray-400 hover:bg-white/5 hover:text-white' // Lien inactif
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </nav>
  )
}