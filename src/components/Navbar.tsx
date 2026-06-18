'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import LiveOnlineCounter from './LiveOnlineCounter'
import { useClientBadges } from '@/hooks/useBadges'

export default function Navbar() {
  const router = useRouter()
  const { cart } = useCart()
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // --- État de la recherche (icône qui déploie un input) ---
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  useEffect(() => {
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0))
  }, [cart])

  // Ferme la recherche desktop avec la touche Échap
  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  // Auto-focus l'input dès qu'on ouvre la recherche desktop
  useEffect(() => {
    if (searchOpen) {
      // Petit délai pour laisser le DOM se monter
      const t = setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [searchOpen])

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => { subscription.unsubscribe() }
  }, [supabase])

  // Notifications des messages non lus du client + changements d'état de commandes
  const { unreadMessages, orderUpdates, clearOrderUpdates } = useClientBadges(user?.id || null)

  // Quand l'utilisateur visite /account, on "consomme" les notifications
  // de changement d'état pour réinitialiser le badge.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/account')) {
      clearOrderUpdates()
    }
  }, [clearOrderUpdates])

  // Soumission de la recherche (desktop + mobile)
  const submitSearch = (rawQuery: string, closeMobileMenu: boolean = false) => {
    const q = rawQuery.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    // On referme l'UI de recherche après redirection
    setSearchOpen(false)
    setSearchQuery('')
    setMobileSearchOpen(false)
    setMobileSearchQuery('')
    if (closeMobileMenu) setMobileMenuOpen(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitSearch(searchQuery)
  }

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitSearch(mobileSearchQuery, true)
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm border-b-2 border-black">
      
      <LiveOnlineCounter />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* GAUCHE : Menu Hamburger + Logo (Groupés ensemble sur mobile) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden text-black hover:text-red-600 focus:outline-none p-1"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <Link href="/" className="text-2xl sm:text-4xl font-montserrat font-black text-black tracking-tighter uppercase">
              EDEN MARKET<span className="text-red-600">.</span>
            </Link>
          </div>

          {/* CENTRE : Liens Desktop */}
          <nav className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/shops" className="text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors">Boutiques</Link>
            <Link href="/la-marketplace" className="text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors">La Marketplace</Link>
            <Link href="/seller/signup" className="text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors">Devenir Vendeur</Link>
          </nav>

          {/* DROITE : Icônes */}
          <div className="flex items-center space-x-5 sm:space-x-6">

            {/* Recherche : icône (desktop uniquement) + entrée dédiée dans le menu mobile */}
            <div className="relative hidden md:flex items-center">
              <button
                type="button"
                aria-label="Ouvrir la recherche"
                onClick={() => {
                  setSearchOpen((v) => !v)
                  // Si on referme, on vide aussi le champ
                  if (searchOpen) setSearchQuery('')
                }}
                className="text-black hover:text-red-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>

              {/* Input expansible — desktop (md+) */}
              {searchOpen && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="hidden md:flex absolute right-full top-1/2 -translate-y-1/2 mr-2 items-center bg-gray-100 border-2 border-black"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="w-56 lg:w-72 px-4 py-2 bg-transparent text-sm font-bold text-black outline-none placeholder-gray-500"
                    aria-label="Rechercher un produit"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-black text-white text-xs font-montserrat font-black uppercase tracking-widest hover:bg-gray-900 transition-colors"
                  >
                    OK
                  </button>
                </form>
              )}
            </div>

            <Link href={user ? '/account' : '/login'} className="text-black hover:text-red-600 transition-colors hidden sm:block relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {orderUpdates > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 border border-red-600 animate-pulse">
                  {orderUpdates}
                </span>
              )}
            </Link>

            <Link href="/account/favorites" className="text-black hover:text-red-600 transition-colors hidden sm:block">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </Link>

            {/* NOUVEAU : Icône de Messagerie (Visible partout) avec Badge */}
            <Link href={user ? '/account/messages' : '/login'} className="text-black hover:text-red-600 transition-colors relative flex items-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 border border-red-600 animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </Link>
            
            {/* Icône Panier (Visible partout) */}
            <Link href="/cart" className="text-black hover:text-red-600 transition-colors relative flex items-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] font-black px-1.5 py-0.5 border border-black">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t-2 border-black bg-white pb-6 pt-4">
            <div className="flex flex-col space-y-4">

              {/* Recherche dans le menu mobile */}
              {mobileSearchOpen ? (
                <form onSubmit={handleMobileSearchSubmit} className="flex items-stretch border-2 border-black bg-gray-100">
                  <input
                    type="text"
                    autoFocus
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="flex-1 px-4 py-3 bg-transparent text-sm font-bold text-black outline-none placeholder-gray-500"
                    aria-label="Rechercher un produit"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-black text-white text-xs font-montserrat font-black uppercase tracking-widest hover:bg-gray-900 transition-colors"
                  >
                    OK
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors px-2 text-left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  Rechercher
                </button>
              )}

              <Link href="/shops" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors px-2">Boutiques</Link>
              <Link href="/la-marketplace" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors px-2">La Marketplace</Link>
              <Link href={user ? '/account' : '/login'} onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-black uppercase tracking-widest hover:text-red-600 transition-colors px-2">
                {user ? 'Mon compte' : 'Se connecter'}
              </Link>
              <Link href="/seller/signup" onClick={() => setMobileMenuOpen(false)} className="mt-4 flex items-center justify-center px-4 py-4 border-2 border-black bg-black text-white text-xs font-montserrat font-black uppercase tracking-widest hover:bg-gray-900 transition-colors">
                Créer un compte vendeur
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}