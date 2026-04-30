'use client'

import Link from 'next/link'
import { useState } from 'react'
import { resetPasswordRequest } from '../auth/actions'

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    setMessage(null)
    
    const result = await resetPasswordRequest(formData)
    
    if (result.error) setMessage({ text: result.error, type: 'error' })
    if (result.success) setMessage({ text: result.success, type: 'success' })
    
    setIsPending(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-walmart-light p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-walmart-darkBlue">Mot de passe oublié ?</h1>
          <p className="mt-2 text-sm text-gray-500">
            Entrez votre adresse e-mail. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {message && (
          <div className={`p-4 text-sm rounded-md text-center ${message.type === 'success' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
            {message.text}
          </div>
        )}

        <form action={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse e-mail
            </label>
            <input
              id="email" name="email" type="email" required placeholder="vous@exemple.com"
              className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none"
            />
          </div>

          <button
            type="submit" disabled={isPending}
            className={`w-full py-3 px-4 text-white rounded-lg font-medium transition-colors ${
              isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-walmart-blue hover:bg-blue-700'
            }`}
          >
            {isPending ? 'Envoi en cours...' : 'Recevoir le lien'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          <Link href="/seller/login" className="font-medium text-walmart-blue hover:underline">
            &larr; Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}