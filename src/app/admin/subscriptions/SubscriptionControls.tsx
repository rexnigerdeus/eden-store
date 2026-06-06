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
    <div className="flex flex-col sm:flex-row gap-2">
      <button 
        onClick={() => handleExtend('monthly')}
        disabled={isUpdating}
        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 bg-white text-black border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 shrink-0"
        title="Ajouter 1 mois"
      >
        + 1 MOIS
      </button>
      <button 
        onClick={() => handleExtend('annual')}
        disabled={isUpdating}
        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 bg-black text-white border-black hover:bg-gray-800 transition-colors disabled:opacity-50 shrink-0"
        title="Ajouter 1 an"
      >
        + 1 AN
      </button>
    </div>
  )
}