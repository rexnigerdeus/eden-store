'use client'

import { useState } from 'react'
import { extendSubscription } from './actions'

export default function SubscriptionControls({ shopId }: { shopId: string }) {
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleExtend(type: 'monthly' | 'annual') {
    const confirmed = window.confirm(`Voulez-vous vraiment valider ce paiement et ajouter 1 ${type === 'monthly' ? 'mois' : 'an'} à cette boutique ?`)
    if (!confirmed) return

    setIsUpdating(true)
    await extendSubscription(shopId, type)
    setIsUpdating(false)
  }

  return (
    <div className="flex space-x-2">
      <button 
        onClick={() => handleExtend('monthly')}
        disabled={isUpdating}
        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50"
        title="Ajouter 1 mois"
      >
        + 1 Mois
      </button>
      <button 
        onClick={() => handleExtend('annual')}
        disabled={isUpdating}
        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-walmart-yellow text-walmart-darkBlue hover:bg-yellow-400 transition-colors shadow-sm disabled:opacity-50"
        title="Ajouter 1 an"
      >
        + 1 An
      </button>
    </div>
  )
}