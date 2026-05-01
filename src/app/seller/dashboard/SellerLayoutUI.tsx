'use client'

import { useState } from 'react'
import { logout } from '../auth/actions'
import NavLinks from './nav-links'

interface SellerLayoutUIProps {
  children: React.ReactNode
  shopName: string
  shopInitial: string
}

export default function SellerLayoutUI({ children, shopName, shopInitial }: SellerLayoutUIProps) {
  // État pour savoir si le menu mobile est ouvert ou fermé
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-walmart-light overflow-hidden relative">
      
      {/* 1. L'OVERLAY SOMBRE SUR MOBILE : Clique dessus pour fermer le menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. LE MENU LATÉRAL (SIDEBAR) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-walmart-darkBlue text-white flex flex-col transition-transform duration-300 ease-in-out 
          md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 md:p-6 flex items-center justify-between bg-walmart-darkBlue border-b border-white/10 md:border-b-0">
          <div>
            <span className="text-xl md:text-2xl font-bold text-walmart-yellow tracking-wider">EDEN store</span>
            <span className="ml-2 text-xs md:text-sm text-gray-300 font-medium">Vendeur</span>
          </div>
          {/* Bouton pour fermer le menu sur mobile */}
          <button 
            className="md:hidden text-gray-300 hover:text-white p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        
        {/* On passe la fonction pour fermer le menu quand on clique sur un lien */}
        <NavLinks onLinkClick={() => setIsMobileMenuOpen(false)} />

        <div className="p-2 md:p-4 border-t border-white/10 mt-auto">
          <form action={logout}>
            <button type="submit" className="w-full text-left px-4 py-2 text-sm md:text-base text-gray-300 hover:text-walmart-yellow transition-colors font-medium">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* 3. LE CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* L'en-tête (Header) avec le bouton Hamburger */}
        <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Le fameux bouton Hamburger (visible uniquement sur mobile) */}
            <button
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h2 className="text-sm sm:text-base md:text-lg font-medium text-walmart-darkBlue truncate">
              Bienvenue dans {shopName}
            </h2>
          </div>

          <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 bg-walmart-blue rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-sm">
            {shopInitial}
          </div>
        </header>

        {/* La page en elle-même */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
      
    </div>
  )
}