'use client'

import Link from 'next/link'
import { useState } from 'react'
import { deleteProduct, toggleProductStock } from './actions'

export default function ProductActions({ 
  productId, 
  isAvailable 
}: { 
  productId: string, 
  isAvailable: boolean 
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")
    if (confirmed) {
      setIsDeleting(true)
      await deleteProduct(productId)
    }
  }

  async function handleToggleStock() {
    setIsToggling(true)
    await toggleProductStock(productId, isAvailable)
    setIsToggling(false)
  }

  return (
    <div className="flex gap-1.5 sm:gap-2 items-center shrink-0">
      
      {/* NOUVEAU : Bouton pour gérer le stock */}
      <button 
        onClick={handleToggleStock}
        disabled={isToggling}
        className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${
          isAvailable 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        }`}
        title={isAvailable ? "Mettre en rupture de stock" : "Remettre en ligne"}
      >
        {isToggling ? '...' : (isAvailable ? 'En ligne' : 'Rupture')}
      </button>

      <Link 
        href={`/seller/dashboard/products/${productId}/edit`}
        className="p-1.5 sm:p-2 text-sm sm:text-base text-gray-400 hover:text-walmart-blue transition-colors rounded-full hover:bg-blue-50 flex items-center justify-center"
        title="Modifier le produit"
      >
        ✏️
      </Link>
      
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className={`p-1.5 sm:p-2 text-sm sm:text-base transition-colors rounded-full hover:bg-red-50 flex items-center justify-center ${
          isDeleting ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'
        }`}
        title="Supprimer le produit"
      >
        {isDeleting ? '⏳' : '🗑️'}
      </button>
    </div>
  )
}