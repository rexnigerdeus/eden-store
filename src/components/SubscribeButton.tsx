'use client'

import { useState } from 'react'
import { toggleSubscription } from '@/app/actions/subscriptionActions'
import { useRouter } from 'next/navigation'

interface SubscribeButtonProps {
  shopId: string
  initialIsSubscribed: boolean
  isLoggedIn: boolean
}

export default function SubscribeButton({ shopId, initialIsSubscribed, isLoggedIn }: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // Mise à jour visuelle instantanée
    const newState = !isSubscribed
    setIsSubscribed(newState)
    setIsLoading(true)

    // Envoi en arrière-plan
    const result = await toggleSubscription(shopId, !newState)

    if (result.error) {
      // En cas d'erreur, on annule l'effet visuel
      setIsSubscribed(!newState)
      alert(result.error)
    }
    
    setIsLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
        isSubscribed 
          ? 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200' 
          : 'bg-walmart-darkBlue text-white hover:bg-blue-900 shadow-sm hover:shadow'
      }`}
    >
      {isSubscribed ? (
        <>
          <span className="text-green-500">✓</span> Abonné
        </>
      ) : (
        <>
          <span>+</span> S'abonner
        </>
      )}
    </button>
  )
}