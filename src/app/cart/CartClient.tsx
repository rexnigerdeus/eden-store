'use client'

import { useCart } from '@/context/CartContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartClient() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Anti-erreur d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-walmart-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Si le panier est vide
  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <span className="text-6xl block mb-4">🛒</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
        <p className="text-gray-500 mb-6">Découvrez nos boutiques et trouvez votre bonheur !</p>
        <Link href="/" className="inline-block bg-walmart-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
          Continuer mes achats
        </Link>
      </div>
    )
  }

  // 🛍️ MAGIE DE MARKETPLACE : Grouper les articles par boutique
  const groupedCart = cart.reduce((groupes: any, item) => {
    if (!groupes[item.shop_id]) {
      groupes[item.shop_id] = {
        shop_name: item.shop_name,
        items: []
      }
    }
    groupes[item.shop_id].items.push(item)
    return groupes
  }, {})

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* PARTIE GAUCHE : La liste des articles groupés par boutique */}
      <div className="flex-1 space-y-6">
        {Object.entries(groupedCart).map(([shopId, shopGroup]: [string, any]) => (
          <div key={shopId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            {/* En-tête de la boutique */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <span className="text-xl">🏪</span>
              <h3 className="font-bold text-gray-900">Vendu par <span className="text-walmart-blue">{shopGroup.shop_name}</span></h3>
            </div>

            {/* Articles de cette boutique */}
            <ul className="divide-y divide-gray-100">
              {shopGroup.items.map((item: any) => (
                <li key={item.product_id} className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  {/* Image du produit */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-2xl">📷</span>
                    )}
                  </div>

                  {/* Infos du produit */}
                  <div className="flex-1 text-center sm:text-left">
                    <Link href={`/product/${item.product_id}`} className="text-lg font-bold text-gray-900 hover:text-walmart-blue transition-colors line-clamp-2">
                      {item.title}
                    </Link>
                    <p className="text-walmart-darkBlue font-bold mt-2">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.price)}
                    </p>
                  </div>

                  {/* Contrôles de quantité et suppression */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 font-medium text-gray-900 border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product_id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Retirer du panier"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* PARTIE DROITE : Le résumé de la commande (Total) */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Résumé de la commande</h2>
          
          <div className="space-y-4 text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Sous-total ({cartCount} articles)</span>
              <span className="font-medium text-gray-900">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(cartTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Frais de livraison</span>
              <span className="text-sm italic">Calculés à l'étape suivante</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total estimé</span>
            <span className="text-2xl font-bold text-walmart-darkBlue">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(cartTotal)}
            </span>
          </div>

          <button 
            onClick={() => router.push('/checkout')}
            className="w-full bg-walmart-blue text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            Passer à la caisse 🔒
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            Paiement 100% sécurisé.
          </p>
        </div>
      </div>

    </div>
  )
}