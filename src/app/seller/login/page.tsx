'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { login } from '../auth/actions'
import PasswordInput from '@/components/PasswordInput'

function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || ''

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">

        {/* Lien de retour à l'accueil */}
        <div className="flex justify-start">
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
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">Espace Vendeur</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
            Connectez-vous pour gérer votre boutique EDEN store.
          </p>
        </div>

        {message && (
          <div className="p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-50 rounded-md text-center">
            {message}
          </div>
        )}

        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" action={login}>
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link href="/seller/forgot-password" className="text-xs sm:text-sm font-medium text-walmart-blue hover:underline">
                  Oublié ?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                required
                placeholder="••••••••"
                inputClassName="focus:ring-1 focus:ring-walmart-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base bg-walmart-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link href="/seller/signup" className="font-medium text-black hover:underline">
            Créer une boutique
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}