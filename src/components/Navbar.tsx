'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Navbar() {
  const { cart } = useCart()
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0))
  }, [cart])

  useEffect(() => {
    // 1. Lire la session actuelle depuis le cache local (pas de vol de lock réseau)
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    fetchSession()

    // 2. Écouter les changements de connexion/déconnexion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm">
      
      {/* 1. BARRE DE PROMOTION (Noire, texte défilant ou centré) */}
      <div className="bg-black text-white text-xs font-bold text-center py-2 uppercase tracking-[0.2em] w-full">
        Jusqu'à -50% sur tout ! Code: <span className="text-red-500">ASIM50</span>
      </div>

      {/* 2. NAVIGATION PRINCIPALE */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* GAUCHE : Menu Mobile Hamburger & Liens Desktop */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden text-black p-2 -ml-2"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
            
            {/* Liens de navigation (Style E-commerce Fashion) */}
            <nav className="hidden md:flex items-center gap-6 font-montserrat font-bold text-sm tracking-wide">
              <Link href="/" className="text-black hover:text-red-600 transition-colors uppercase">Nouveautés</Link>
              <Link href="/category/vetements" className="text-black hover:text-red-600 transition-colors uppercase">Vêtements</Link>
              <Link href="/category/accessoires" className="text-black hover:text-red-600 transition-colors uppercase">Accessoires</Link>
              <Link href="/shops" className="text-gray-500 hover:text-black transition-colors uppercase">Boutiques</Link>
            </nav>
          </div>

          {/* CENTRE : LOGO (Imposant et centré sur desktop) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none">
            <Link href="/" className="font-montserrat font-black text-3xl tracking-tighter text-black">
              ASIM<span className="text-red-600">.</span>
            </Link>
          </div>

          {/* DROITE : Icônes d'action (Recherche, Compte, Favoris, Panier) */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Icône Recherche */}
            <Link href="/search" className="text-black hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </Link>

            {/* Icône Compte (Desktop uniquement) */}
            <Link href={user ? "/account" : "/login"} className="hidden sm:block text-black hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </Link>

            {/* Icône Favoris ❤️ */}
            <Link href="/account/favorites" className="text-black hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </Link>

            {/* Icône Panier avec Badge au style minimaliste */}
            <Link href="/cart" className="relative text-black hover:text-gray-600 flex items-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
          </div>
        </div>

        {/* Menu Mobile déroulant */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 bg-white">
            <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col gap-4 font-montserrat font-bold text-sm tracking-wide">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-black hover:text-red-600 transition-colors uppercase"
              >
                Nouveautés
              </Link>
              <Link
                href="/category/vetements"
                onClick={() => setMobileMenuOpen(false)}
                className="text-black hover:text-red-600 transition-colors uppercase"
              >
                Vêtements
              </Link>
              <Link
                href="/category/accessoires"
                onClick={() => setMobileMenuOpen(false)}
                className="text-black hover:text-red-600 transition-colors uppercase"
              >
                Accessoires
              </Link>
              <Link
                href="/shops"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-black transition-colors uppercase"
              >
                Boutiques
              </Link>
              <Link
                href={user ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="text-black hover:text-gray-600 transition-colors uppercase sm:hidden"
              >
                {user ? 'Mon compte' : 'Se connecter'}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}