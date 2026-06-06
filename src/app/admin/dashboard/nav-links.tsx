'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()

  const links = [
    { name: "Vue d'ensemble", href: '/admin/dashboard' },
    { name: 'Catégories', href: '/admin/categories' },
    { name: 'Vendeurs', href: '/admin/shops' },
    { name: 'Abonnements', href: '/admin/subscriptions' },
  ]

  return (
    <nav className="flex-1 px-4 space-y-1.5 mt-6">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (pathname.startsWith(link.href) && link.href !== '/admin/dashboard')

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className={`block px-4 py-3 font-montserrat font-bold text-xs uppercase tracking-widest transition-colors rounded-none ${
              isActive
                ? 'bg-white text-black font-black'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {link.name}
          </Link>
        )
      })}

      {/* Séparateur + retour au site public */}
      <div className="pt-6 mt-6 border-t border-white/10">
        <Link
          href="/"
          onClick={onLinkClick}
          className="block px-4 py-3 font-montserrat font-bold text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          ↩ Retour au site public
        </Link>
      </div>
    </nav>
  )
}
