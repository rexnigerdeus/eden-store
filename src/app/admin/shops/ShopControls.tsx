'use client'

import { useState } from 'react'
import { toggleShopTier, updateShopStatus } from './actions'

const statuses = [
  { value: 'unpaid', label: 'Impayé / Bloqué' },
  { value: 'pending_verification', label: 'Vérification en cours' },
  { value: 'active', label: 'Actif (En ligne)' },
  { value: 'expired', label: 'Expiré (Suspendu)' },
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
    <div className="flex items-center space-x-4">
      
      {/* 1. Bouton pour passer en Partenaire ou Standard */}
      <button 
        onClick={handleTierToggle}
        disabled={isUpdating}
        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
          shop.subscription_tier === 'partner' 
            ? 'bg-walmart-yellow text-walmart-darkBlue hover:bg-yellow-400' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {shop.subscription_tier === 'partner' ? '⭐ Partenaire' : 'Standard'}
      </button>

      {/* 2. Menu déroulant pour le statut */}
      <div className="relative">
        <select
          value={shop.subscription_status}
          onChange={handleStatusChange}
          disabled={isUpdating}
          className={`appearance-none font-medium text-xs rounded-md px-3 py-1.5 pr-8 outline-none border cursor-pointer transition-colors ${
            shop.subscription_status === 'active' ? 'bg-green-50 border-green-200 text-green-700' :
            shop.subscription_status === 'pending_verification' ? 'bg-orange-50 border-orange-200 text-orange-700' :
            'bg-red-50 border-red-200 text-red-700'
          } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <span className="text-[10px]">▼</span>
        </div>
      </div>

    </div>
  )
}