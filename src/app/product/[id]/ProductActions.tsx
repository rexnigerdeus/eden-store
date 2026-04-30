'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

export default function ProductActions({ product }: { product: any }) {
  const { addToCart } = useCart()
  const router = useRouter()
  
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  // Prépare l'objet article pour le panier
  const cartItem = {
    product_id: product.id,
    title: product.title,
    price: product.price,
    quantity: quantity,
    shop_id: product.shop_id || product.shops?.id,
    shop_name: product.shops?.name || 'Boutique',
    cover_image_url: product.cover_image_url
  }

  // Action 1 : Ajouter au panier et rester sur la page
  const handleAddToCart = () => {
    addToCart(cartItem)
    setIsAdded(true)
    // Le bouton redevient normal après 2 secondes
    setTimeout(() => setIsAdded(false), 2000)
  }

  // Action 2 : Acheter maintenant (Ajoute au panier et redirige)
  const handleBuyNow = () => {
    addToCart(cartItem)
    router.push('/cart') // On l'envoie vers le panier pour valider
  }

  return (
    <div className="space-y-4 mt-8">
      {/* Sélecteur de quantité */}
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">Quantité :</span>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            -
          </button>
          <span className="px-4 py-1 font-medium text-gray-900 border-x border-gray-300">
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Les deux boutons stratégiques */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 flex justify-center items-center gap-2 ${
            isAdded 
              ? 'bg-green-500 text-white shadow-md' 
              : 'bg-blue-50 text-walmart-blue hover:bg-blue-100 border border-blue-200'
          }`}
        >
          {isAdded ? '✓ Ajouté au panier' : '🛒 Ajouter au panier'}
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 bg-walmart-blue hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300"
        >
          ⚡ Acheter maintenant
        </button>
      </div>
    </div>
  )
}