'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logoutAdmin } from './actions'
import NavLinks from './nav-links'

interface AdminLayoutUIProps {
  children: React.ReactNode
  adminEmail: string
  adminInitial: string
}

export default function AdminLayoutUI({ children, adminEmail, adminInitial }: AdminLayoutUIProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="flex min-h-screen md:h-screen bg-gray-50 md:overflow-hidden relative font-sans">

      {/* 1. OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* 2. SIDEBAR BRUTALISTE (Noir Pur) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-white/10 rounded-none
          md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* En-tête de la sidebar */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-2xl font-montserrat font-black text-white tracking-tighter truncate">EDEN MARKET.</span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest shrink-0">Admin</span>
          </div>
          <button
            type="button"
            className="md:hidden text-gray-400 hover:text-white text-xs uppercase font-bold tracking-wider shrink-0"
            onClick={closeMenu}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        {/* Liens de navigation */}
        <NavLinks onLinkClick={closeMenu} />

        {/* Pied de sidebar : retour au site + déconnexion */}
        <div className="p-4 border-t border-white/10 space-y-3 mt-auto">
          <Link
            href="/"
            onClick={closeMenu}
            className="block w-full text-center py-3 text-[10px] font-montserrat font-bold text-gray-400 uppercase tracking-widest border border-white/20 hover:border-white hover:text-white transition-colors rounded-none"
          >
            ↩ Retour au site public
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full text-center py-3 text-[10px] font-montserrat font-bold uppercase tracking-widest text-red-400 border border-red-600/50 hover:border-red-600 hover:bg-red-600 hover:text-white transition-colors rounded-none"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* 3. BLOC DE CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 md:overflow-hidden bg-white w-full">

        {/* Header supérieur (toujours visible, même desktop — utile pour le toggle mobile) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 md:px-8 flex-shrink-0 sticky top-0 z-30 md:static">
          <div className="flex items-center gap-4 min-w-0">
            {/* BOUTON TOGGLE — visible uniquement <md */}
            <button
              type="button"
              className="md:hidden p-2 -ml-2 text-black hover:bg-gray-100 transition-colors shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h2 className="text-xs sm:text-sm font-montserrat font-bold text-black uppercase tracking-wider truncate">
              Console / <span className="text-gray-500">Supervision</span>
            </h2>
          </div>

          {/* Badge Admin + email */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:block text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[180px]">
              {adminEmail}
            </span>
            <div className="w-8 h-8 bg-red-600 text-white text-xs font-bold font-montserrat flex items-center justify-center border border-red-600 rounded-none shrink-0">
              {adminInitial}
            </div>
          </div>
        </header>

        {/* Espace de rendu des pages */}
        <div className="flex-1 md:overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-white">
          {children}
        </div>
      </main>

    </div>
  )
}
