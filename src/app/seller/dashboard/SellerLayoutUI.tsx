'use client'

import { useState } from 'react'
import { logout } from '../auth/actions'
import NavLinks from './nav-links'
import Link from 'next/link'
import { useSellerBadges } from '@/hooks/useBadges'

interface SellerLayoutUIProps {
  children: React.ReactNode
  shopName: string
  shopInitial: string
  shopId: string | null
  userId: string | null
}

export default function SellerLayoutUI({ children, shopName, shopInitial, shopId, userId }: SellerLayoutUIProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // On active les badges temps réel pour le vendeur
  const { unreadMessages } = useSellerBadges(shopId, userId)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative font-sans">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-white/10 rounded-none
          md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-montserrat font-black text-white tracking-tighter">ASIM.</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Studio</span>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-white text-xs uppercase font-bold tracking-wider"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Fermer
          </button>
        </div>
        
        <NavLinks onLinkClick={() => setIsMobileMenuOpen(false)} />

        <div className="p-4 border-t border-white/10">
          <form action={logout}>
            <button type="submit" className="w-full text-center py-3 text-xs font-montserrat font-bold text-gray-400 uppercase tracking-widest border border-white/20 hover:border-white hover:text-white transition-colors rounded-none">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-black hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h2 className="text-xs sm:text-sm font-montserrat font-bold text-black uppercase tracking-wider truncate">
              Gestion / <span className="text-gray-500">{shopName}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* NOUVEAU : Icône Messagerie Globale (Avec Badge) */}
            <Link href="/seller/dashboard/messages" className="text-black hover:text-red-600 transition-colors relative flex items-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 border border-red-600 animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </Link>

            <div className="w-8 h-8 bg-black text-white text-xs font-bold font-montserrat flex items-center justify-center border border-black rounded-none">
              {shopInitial}
            </div>
            
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-white">
          {children}
        </div>
      </main>
      
    </div>
  )
}