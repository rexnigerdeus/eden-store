'use client'

import { useState } from 'react'
import { toggleFavorite } from '@/app/actions/favoriteActions'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  productId: string
  initialIsFavorite: boolean
  isLoggedIn: boolean
}

export default function FavoriteButton({ productId, initialIsFavorite, isLoggedIn }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    // Si pas connecté, on l'envoie vers la page de connexion
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // 1. Mise à jour immédiate de l'UI (Optimistic update)
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300) // Durée de l'animation

    // 2. Envoi au serveur en arrière-plan
    const result = await toggleFavorite(productId, !newFavoriteState)

    // 3. Si le serveur renvoie une erreur, on annule visuellement
    if (result.error) {
      setIsFavorite(!newFavoriteState)
      alert(result.error)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 border ${
        isFavorite 
          ? 'bg-red-50 border-red-100 text-red-500' 
          : 'bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 hover:bg-red-50'
      } ${isAnimating ? 'scale-125' : 'scale-100'}`}
      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={isFavorite ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-6 h-6"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  )
}