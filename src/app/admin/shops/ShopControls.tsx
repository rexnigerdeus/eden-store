'use client'

import { useState } from 'react'
import { toggleShopTier, updateShopStatus } from './actions'

const statuses = [
  { value: 'unpaid', label: 'Bloqué' },
  { value: 'pending_verification', label: 'Vérification' },
  { value: 'active', label: 'Actif' },
  { value: 'expired', label: 'Expiré' },
]

export default function ShopControls({ shop }: { shop: any }) {
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleTierToggle() {
    setIsUpdating(true)
    await toggleShopTier(shop.id, shop.subscription_tier)
    setIsUpdating(false)
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setIsUpdating(true)
    await updateShopStatus(shop.id, e.target.value)
    setIsUpdating(false)
  }

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
      
      {/* 1. Bouton Niveau (Partenaire/Standard) - Aspect Tampon Officiel */}
      <button 
        onClick={handleTierToggle}
        disabled={isUpdating}
        className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-2 transition-colors shrink-0 ${
          shop.subscription_tier === 'partner' 
            ? 'bg-black text-white border-black hover:bg-gray-800' 
            : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
        } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
      >
        {shop.subscription_tier === 'partner' ? '★ Partenaire' : 'Standard'}
      </button>

      {/* 2. Menu déroulant pour le statut - Aspect Input Terminal */}
      <div className="relative w-full sm:w-40">
        <select
          value={shop.subscription_status}
          onChange={handleStatusChange}
          disabled={isUpdating}
          className={`w-full appearance-none font-bold text-[10px] uppercase tracking-widest rounded-none px-4 py-3 pr-8 outline-none border-2 cursor-pointer transition-colors ${
            shop.subscription_status === 'active' ? 'bg-green-50 border-green-600 text-green-700' :
            shop.subscription_status === 'pending_verification' ? 'bg-gray-100 border-black text-black' :
            'bg-red-50 border-red-600 text-red-600'
          } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value} className="bg-white text-black font-bold uppercase">{s.label}</option>
          ))}
        </select>
        
        {/* Flèche du Dropdown */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

    </div>
  )
}