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

  // --- CLASSES CSS RÉUTILISABLES (Design Brut / Streetwear) ---
  const inputClasses = "w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors rounded-none"
  const disabledInputClasses = "w-full p-4 text-sm font-bold text-gray-400 bg-gray-100 border-2 border-gray-200 cursor-not-allowed rounded-none"
  const labelClasses = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"

  return (
    <form action={onSubmit} className="space-y-8">
      
      {/* Message de succès brutaliste */}
      {successMessage && (
        <div className="p-4 border-2 border-green-600 bg-green-50 text-xs font-bold uppercase tracking-widest text-green-700">
          ✓ {successMessage}
        </div>
      )}

      {/* Affichage de l'avatar actuel (Format Carré Strict) */}
      {profile?.avatar_url && (
        <div className="mb-6">
          <span className={labelClasses}>Avatar de profil</span>
          <div className="w-24 h-24 border-2 border-black bg-gray-50 overflow-hidden rounded-none">
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      )}

      {/* Informations d'identité */}
      <div className="space-y-6">
        <div>
          <label htmlFor="full_name" className={labelClasses}>Nom complet *</label>
          <input
            id="full_name" 
            name="full_name" 
            type="text" 
            required 
            defaultValue={profile?.full_name || ''} 
            placeholder="Ex: Jean Dupont"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>
            Adresse e-mail (Identifiant de connexion)
          </label>
          <input
            id="email" 
            type="email" 
            disabled 
            defaultValue={email}
            className={disabledInputClasses}
          />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">
            L'adresse e-mail ne peut pas être modifiée ici pour des raisons de sécurité.
          </p>
        </div>
      </div>

      {/* BOUTON ENREGISTRER (Sticky et massif) */}
      <div className="border-t border-gray-200 pt-6">
        <button
          type="submit" 
          disabled={isPending}
          className={`w-full md:w-auto px-10 py-4 bg-black text-white text-sm font-montserrat font-black uppercase tracking-widest hover:bg-gray-900 transition-colors border-2 border-black rounded-none ${
            isPending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer mon profil'}
        </button>
      </div>
      
    </form>
  )
}