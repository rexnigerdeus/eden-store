'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { signup } from '../auth/actions'
import PasswordInput from '@/components/PasswordInput'
import SellerCharter from './SellerCharter'

function SignupForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || ''

  // Étape 1 = charte, étape 2 = formulaire
  const [charterAccepted, setCharterAccepted] = useState(false)

  // ÉTAPE 1 — Charte à accepter
  if (!charterAccepted) {
    return <SellerCharter onAccepted={() => setCharterAccepted(true)} />
  }

  // ÉTAPE 2 — Formulaire d'inscription (affiché uniquement après acceptation)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Lien de retour à l'accueil + rappel charte */}
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-black transition-colors group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </Link>

          <button
            type="button"
            onClick={() => setCharterAccepted(false)}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            title="Revoir la charte"
          >
            📋 Charte acceptée
          </button>
        </div>

        {/* En-tête */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 mb-3 text-[10px] font-black uppercase tracking-[0.2em] bg-green-100 text-green-700 border border-green-600">
            ✓ Charte acceptée
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">
            Devenir vendeur sur EDEN MARKET
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
            Créez votre compte pour finaliser la création de votre boutique.
          </p>
        </div>

        {/* Affichage des messages d'erreur éventuels */}
        {message && (
          <div className="p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-50 rounded-md text-center">
            {message}
          </div>
        )}

        {/* Formulaire lié à l'Action Serveur */}
        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" action={signup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors outline-none text-gray-900"
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                placeholder="••••••••"
                inputClassName="focus:ring-1 focus:ring-black focus:border-black transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base bg-walmart-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Créer mon compte vendeur
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
          En créant votre compte, vous reconnaissez avoir accepté notre charte vendeur.
        </p>

        <p className="text-center text-xs sm:text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link href="/seller/login" className="font-medium text-black hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}
