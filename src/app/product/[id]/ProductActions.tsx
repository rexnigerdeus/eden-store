'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

export default function ProductActions({ product }: { product: any }) {
  const { addToCart } = useCart()
  const router = useRouter()

  const isOutOfStock = product.is_available === false
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  const cartItem = {
    product_id: product.id,
    title: product.title,
    price: product.price,
    quantity: quantity,
    shop_id: product.shop_id || product.shops?.id,
    shop_name: product.shops?.name || 'Boutique',
    cover_image_url: product.cover_image_url
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addToCart(cartItem)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return
    addToCart(cartItem)
    router.push('/cart')
  }

  return (
    <div className="mt-6 mb-8 w-full space-y-4">

      {/* SÉLECTEUR DE QUANTITÉ */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Quantité
        </label>
        <div className={`flex items-center justify-between border w-32 h-12 bg-white ${isOutOfStock ? 'border-gray-200 opacity-50 pointer-events-none' : 'border-gray-300'}`}>
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isOutOfStock}
            className="w-10 h-full text-xl text-black hover:bg-gray-100 transition-colors flex items-center justify-center disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="font-bold text-sm text-black">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={isOutOfStock}
            className="w-10 h-full text-xl text-black hover:bg-gray-100 transition-colors flex items-center justify-center disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      {/* BOUTONS D'ACTION (Pleine largeur sur mobile, fin du bug d'écrasement) */}
      <div className="flex flex-col gap-3 w-full">
        {isOutOfStock ? (
          <>
            <button
              type="button"
              disabled
              className="w-full h-14 text-sm font-bold uppercase tracking-widest bg-gray-200 text-gray-500 cursor-not-allowed flex justify-center items-center shrink-0"
            >
              ✕ Rupture de stock — Indisponible
            </button>
            <button
              type="button"
              disabled
              className="w-full h-14 text-sm font-bold uppercase tracking-widest bg-white border-2 border-gray-200 text-gray-400 cursor-not-allowed flex justify-center items-center shrink-0"
            >
              Acheter maintenant
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`w-full h-14 text-sm font-bold uppercase tracking-widest transition-all duration-300 flex justify-center items-center shrink-0 ${
                isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              {isAdded ? '✓ Ajouté au panier' : 'Ajouter au panier'}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full h-14 text-sm font-bold uppercase tracking-widest transition-all duration-300 flex justify-center items-center bg-white border-2 border-black text-black hover:bg-gray-50 shrink-0"
            >
              Acheter maintenant
            </button>
          </>
        )}
      </div>
    </div>
  )
}