'use client'

import { useCart } from '@/context/CartContext'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { checkCartStock } from './actions'

export default function CartClient() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart()
  const [mounted, setMounted] = useState(false)
  const [outOfStockIds, setOutOfStockIds] = useState<string[]>([])
  const [stockChecked, setStockChecked] = useState(false)
  const router = useRouter()

  // Anti-erreur d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  // Vérification du stock des produits du panier
  const refreshStockCheck = useCallback(async () => {
    if (cart.length === 0) {
      setOutOfStockIds([])
      setStockChecked(true)
      return
    }
    const ids = cart.map((item) => item.product_id)
    const { outOfStockIds } = await checkCartStock(ids)
    setOutOfStockIds(outOfStockIds)
    setStockChecked(true)
  }, [cart])

  useEffect(() => {
    if (mounted) {
      refreshStockCheck()
    }
  }, [mounted, refreshStockCheck])

  // Produit-il au moins un produit en rupture ?
  const hasOutOfStockItems = outOfStockIds.length > 0

  if (!mounted) {
    return (
      <div className="flex justify-center py-12 sm:py-20">
        <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin"></div>
      </div>
    )
  }

  // 1. ÉTAT : PANIER VIDE (Design Brut)
  if (cart.length === 0) {
    return (
      <div className="text-center py-20 md:py-32 bg-gray-50 border border-gray-200">
        <h2 className="text-2xl md:text-4xl font-montserrat font-black text-black uppercase tracking-tight mb-4">
          Votre panier est vide
        </h2>
        <p className="text-sm md:text-base text-gray-500 uppercase tracking-widest mb-8">
          Découvrez nos nouveautés et commencez vos achats.
        </p>
        <Link href="/" className="inline-block px-10 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors border-2 border-black">
          Continuer mes achats
        </Link>
      </div>
    )
  }

  // 🛍️ MAGIE DE MARKETPLACE : Grouper les articles par boutique (Logique Intacte)
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

  // 2. ÉTAT : PANIER REMPLI
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

      {/* PARTIE GAUCHE : La liste des articles groupés par boutique */}
      <div className="flex-1 space-y-10">
        {/* Bandeau d'alerte si un produit est en rupture */}
        {hasOutOfStockItems && (
          <div className="p-4 border-2 border-red-600 bg-red-50 text-sm font-bold text-red-700 uppercase tracking-widest flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <span>
              {outOfStockIds.length === 1
                ? 'Un article de votre panier est en rupture de stock. Veuillez le retirer pour pouvoir commander.'
                : `${outOfStockIds.length} articles de votre panier sont en rupture de stock. Veuillez les retirer pour pouvoir commander.`}
            </span>
          </div>
        )}

        {Object.entries(groupedCart).map(([shopId, shopGroup]: [string, any]) => (
          <div key={shopId} className="w-full">

            {/* En-tête de la boutique (Épuré et brutaliste) */}
            <div className="pb-3 border-b-2 border-black mb-4 flex justify-between items-end">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Vendu par
              </span>
              <h3 className="text-sm md:text-base font-montserrat font-black text-black uppercase tracking-widest">
                {shopGroup.shop_name}
              </h3>
            </div>

            {/* Articles de cette boutique */}
            <div className="divide-y divide-gray-200">
              {shopGroup.items.map((item: any) => {
                const isOutOfStock = outOfStockIds.includes(item.product_id)
                return (
                <div key={item.product_id} className={`py-6 flex gap-4 sm:gap-6 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>

                  {/* Image du produit (Format vertical Fashion) */}
                  <div className="w-24 h-32 flex-shrink-0 bg-gray-100 border border-gray-200 relative">
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xs font-montserrat font-bold text-gray-400 uppercase">EDEN MARKET</span>
                    )}
                    {/* Badge "En rupture" sur l'image */}
                    {isOutOfStock && (
                      <div className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5">
                        Rupture
                      </div>
                    )}
                  </div>

                  {/* Infos du produit et Actions */}
                  <div className="flex-1 flex flex-col justify-between py-1">

                    {/* Titre et Prix (En haut) */}
                    <div className="flex justify-between items-start gap-4">
                      <Link href={`/product/${item.product_id}`} className="text-sm md:text-base font-montserrat font-bold text-black uppercase tracking-wide hover:underline line-clamp-2">
                        {item.title}
                      </Link>
                      <span className="text-sm md:text-base font-bold text-red-600 shrink-0">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.price)}
                      </span>
                    </div>

                    {/* Mention rupture de stock */}
                    {isOutOfStock && (
                      <p className="mt-2 text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-widest">
                        ⚠ Ce produit est actuellement en rupture de stock. Il doit être retiré pour valider la commande.
                      </p>
                    )}

                    {/* Quantité et Suppression (En bas) */}
                    <div className="flex items-end justify-between mt-4">
                      {/* Contrôles de quantité (Carrés et plats) */}
                      <div className={`flex items-center border h-10 w-28 bg-white ${isOutOfStock ? 'border-gray-200 opacity-50 pointer-events-none' : 'border-gray-300'}`}>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={isOutOfStock}
                          className="w-8 h-full text-lg hover:bg-gray-100 text-black transition-colors disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-bold text-sm text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={isOutOfStock}
                          className="w-8 h-full text-lg hover:bg-gray-100 text-black transition-colors disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* Bouton Supprimer discret (Lien souligné) */}
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors underline pb-1"
                        title="Retirer du panier"
                      >
                        Supprimer
                      </button>
                    </div>

                  </div>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>

      {/* PARTIE DROITE : Le résumé de la commande (Total) */}
      <div className="w-full lg:w-[400px] shrink-0">
        <div className="bg-gray-50 p-6 md:p-8 border-2 border-black sticky top-20 sm:top-24">
          <h2 className="text-lg font-montserrat font-black uppercase tracking-widest text-black mb-6 border-b border-gray-200 pb-4">
            Résumé
          </h2>

          <div className="space-y-4 mb-6 text-sm font-bold uppercase tracking-wide">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total ({cartCount})</span>
              <span className="text-black">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(cartTotal)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span className="text-xs text-gray-400 normal-case italic font-normal">Calculée à l'étape suivante</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-8 flex justify-between items-center text-black">
            <span className="font-bold text-sm uppercase tracking-widest">Total estimé</span>
            <span className="text-xl font-montserrat font-black text-red-600">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(cartTotal)}
            </span>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            disabled={hasOutOfStockItems || !stockChecked}
            className="w-full bg-black text-white py-4 font-montserrat font-black uppercase tracking-widest text-sm shadow-sm hover:bg-gray-900 transition-all border-2 border-black disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
          >
            {hasOutOfStockItems ? 'Commande bloquée' : 'Valider la commande'}
          </button>

          <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mt-6">
            🔒 Paiement 100% sécurisé
          </p>
        </div>
      </div>

    </div>
  )
}