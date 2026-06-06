'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import LiveOnlineCounter from './LiveOnlineCounter'
import { useClientBadges } from '@/hooks/useBadges' // <-- Import du Hook

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

  // Notifications des messages non lus du client
  const { unreadMessages } = useClientBadges(user?.id || null)

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm border-b-2 border-black">
      
      <LiveOnlineCounter />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Menu Hamburger */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-black hover:text-red-600 focus:outline-none"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Liens Desktop Gauche */}
          <nav className="hidden sm:flex space-x-8">
            <Link href="/category/vetements" className="text-sm font-bold text-black uppercase tracking-widest hover:text-red-600 transition-colors">Vêtements</Link>
            <Link href="/category/accessoires" className="text-sm font-bold text-black uppercase tracking-widest hover:text-red-600 transition-colors">Accessoires</Link>
            <Link href="/shops" className="text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors">Marques</Link>
          </nav>

          {/* Logo Central */}
          <div className="flex justify-center flex-1 sm:flex-none">
            <Link href="/" className="text-4xl font-montserrat font-black text-black tracking-tighter uppercase">
              EDEN store<span className="text-red-600">.</span>
            </Link>
          </div>

          {/* Icônes Desktop Droite */}
          <div className="flex items-center space-x-6">
            <Link href="/search" className="text-black hover:text-red-600 transition-colors hidden sm:block">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </Link>
            
            {/* Icône de Compte + BADGE MESSAGES */}
            <Link href={user ? '/account' : '/login'} className="text-black hover:text-red-600 transition-colors hidden sm:block relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 border border-red-600 animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </Link>

            <Link href="/account/favorites" className="text-black hover:text-red-600 transition-colors hidden sm:block">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </Link>
            
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
          <nav className="sm:hidden border-t-2 border-black bg-white pb-6 pt-4">
            <div className="flex flex-col space-y-4">
              <Link href="/category/vetements" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-black uppercase tracking-widest hover:text-red-600 transition-colors">Vêtements</Link>
              <Link href="/category/accessoires" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-black uppercase tracking-widest hover:text-red-600 transition-colors">Accessoires</Link>
              <Link href="/shops" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors">Marques</Link>
              
              <Link href={user ? '/account' : '/login'} onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-black uppercase tracking-widest hover:text-red-600 transition-colors flex justify-between items-center">
                <span>{user ? 'Mon compte' : 'Se connecter'}</span>
                {unreadMessages > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 border border-red-600 animate-pulse">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              {/* Bouton Vendeur Mobile */}
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