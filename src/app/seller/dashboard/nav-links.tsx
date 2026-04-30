'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks() {
  const pathname = usePathname()

  // Notre liste de liens
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
    <nav className="flex-1 px-4 space-y-2 mt-4">
      {links.map((link) => {
        // On vérifie si l'URL actuelle correspond au lien
        // (On gère le cas particulier de l'Aperçu pour éviter qu'il soit toujours actif)
        const isActive = 
          pathname === link.href || 
          (pathname.startsWith(link.href) && link.href !== '/seller/dashboard')

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`block px-4 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? 'bg-walmart-blue text-white shadow-sm' // Style actif
                : 'text-gray-300 hover:bg-white/10 hover:text-white' // Style inactif
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </nav>
  )
}