'use client'

import { useState } from 'react'
import { updateProfile } from './actions'

export default function ProfileForm({ profile, email }: { profile: any, email: string }) {
  const [isPending, setIsPending] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    setSuccessMessage('')
    const result = await updateProfile(formData)
    setIsPending(false)
    if (result?.success) {
      setSuccessMessage(result.success)
      setTimeout(() => setSuccessMessage(''), 4000)
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
      
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center shadow-sm">
          <span className="text-green-500 mr-3 text-xl">✓</span>
          <p className="text-green-700 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Affichage de l'avatar actuel s'il existe */}
      {profile?.avatar_url && (
        <div className="mb-6">
          <img 
            src={profile.avatar_url} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full object-cover border-4 border-walmart-light shadow-sm"
          />
        </div>
      )}

      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
          Photo de profil (Optionnel)
        </label>
        <input
          id="avatar" name="avatar" type="file" accept="image/*"
          className="w-full text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-walmart-light file:text-walmart-blue hover:file:bg-blue-100"
        />
      </div>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom complet
        </label>
        <input
          id="full_name" name="full_name" type="text" defaultValue={profile?.full_name || ''} placeholder="Ex: Jean Dupont"
          className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Adresse e-mail (Sert d'identifiant de connexion)
        </label>
        <input
          id="email" type="email" disabled defaultValue={email}
          className="w-full px-4 py-3 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">L'adresse e-mail ne peut pas être modifiée ici pour des raisons de sécurité.</p>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit" disabled={isPending}
          className={`px-8 py-3 font-semibold rounded-lg transition-colors shadow-sm text-white ${
            isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-walmart-blue hover:bg-blue-700'
          }`}
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer mon profil'}
        </button>
      </div>
    </form>
  )
}