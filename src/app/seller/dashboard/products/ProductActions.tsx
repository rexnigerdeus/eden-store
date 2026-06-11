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
    const confirmed = window.confirm("ATTENTION : Voulez-vous vraiment supprimer ce produit de votre catalogue ?")
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
    <div className="flex gap-2 items-center w-full mt-2">
      
      {/* Bouton pour gérer le stock */}
      <button 
        onClick={handleToggleStock}
        disabled={isToggling}
        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-colors ${
          isAvailable 
            ? 'border-gray-300 bg-white text-gray-500 hover:border-black hover:text-black' 
            : 'border-black bg-black text-white hover:bg-gray-900'
        }`}
      >
        {isToggling ? '...' : (isAvailable ? 'Marquer en rupture' : 'Remettre en vente')}
      </button>

      {/* Bouton Modifier */}
      <Link 
        href={`/seller/dashboard/products/${productId}/edit`}
        className="w-10 h-10 border-2 border-gray-300 bg-white flex items-center justify-center text-black hover:border-black transition-colors"
        title="Modifier"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </Link>
      
      {/* Bouton Supprimer */}
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-10 h-10 border-2 border-transparent bg-red-50 text-red-600 flex items-center justify-center hover:border-red-600 transition-colors disabled:opacity-50"
        title="Supprimer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
      
    </div>
  )
}