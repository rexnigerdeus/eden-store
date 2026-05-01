'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signupBuyer } from '../auth/actions'

export default function SignupForm() {
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    setErrorMessage('')
    const result = await signupBuyer(formData)
    if (result?.error) {
      setErrorMessage(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-walmart-darkBlue">Créer un compte</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Rejoignez EDEN store pour suivre vos commandes et acheter plus rapidement.</p>
      </div>

      {errorMessage && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
          {errorMessage}
        </div>
      )}

      <form action={onSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
          <input id="fullName" name="fullName" type="text" required placeholder="Ex: Jean Dupont" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
          <input id="email" name="email" type="email" required placeholder="vous@exemple.com" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none" />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input id="password" name="password" type="password" required placeholder="••••••••" minLength={6} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none" />
          <p className="text-xs text-gray-500 mt-1">6 caractères minimum.</p>
        </div>

        <button type="submit" disabled={isPending} className={`w-full py-3 sm:py-4 text-white font-bold text-base sm:text-lg rounded-xl transition-colors shadow-sm mt-2 ${isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-walmart-blue hover:bg-blue-700'}`}>
          {isPending ? 'Création en cours...' : 'M\'inscrire'}
        </button>
      </form>

      <p className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
        Déjà client ?{' '}
        <Link href="/login" className="font-medium text-walmart-blue hover:underline">Se connecter</Link>
      </p>
    </div>
  )
}