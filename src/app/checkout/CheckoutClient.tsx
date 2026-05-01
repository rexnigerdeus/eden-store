'use client'

import { useCart } from '@/context/CartContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { placeOrder } from './actions'
import Link from 'next/link'

export default function CheckoutClient({ userProfile }: { userProfile: any }) {
  const { cart, cartTotal, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Pour stocker les commandes validées des invités
  const [successOrders, setSuccessOrders] = useState<{id: string, shop_name: string}[] | null>(null)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null
  
  // Si le panier est vide et qu'on n'est pas sur l'écran de succès
  if (cart.length === 0 && !successOrders) {
    router.push('/cart')
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const shippingData = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      password: formData.get('password') as string || undefined,
    }

    const result = await placeOrder(cart, shippingData)

    if (result.success) {
      clearCart()
      // Si connecté OU s'il a créé un compte, on l'envoie sur son Dashboard
      if (userProfile || shippingData.password) {
        router.push('/account?success=true')
      } else {
        // Mode Invité complet : On affiche les numéros de suivi sur place !
        setSuccessOrders(result.createdOrders || [])
      }
    } else {
      alert(result.error)
      setIsSubmitting(false)
    }
  }

  const inputClasses = "w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-walmart-blue text-gray-900 bg-white placeholder-gray-400 font-medium"

  // ==========================================
  // ÉCRAN DE SUCCÈS POUR LES INVITES
  // ==========================================
  if (successOrders) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-16 text-center space-y-6 sm:space-y-8">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-4xl sm:text-5xl mb-4 sm:mb-6">✓</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Commande validée !</h1>
        <p className="text-base sm:text-lg text-gray-500">Merci pour votre achat. Voici vos numéros de suivi à conserver précieusement :</p>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm text-left max-w-lg mx-auto space-y-3 sm:space-y-4">
          {successOrders.map((order, i) => (
            <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 gap-2 sm:gap-0">
              <span className="font-medium text-gray-700 text-sm sm:text-base">{order.shop_name}</span>
              <span className="font-mono font-bold text-walmart-blue text-base sm:text-lg select-all cursor-pointer" title="Double-cliquez pour copier">{order.id}</span>
            </div>
          ))}
        </div>
        
        <p className="text-xs sm:text-sm text-gray-400 mt-4">Vous pouvez suivre ces commandes via l'onglet "Suivi rapide" dans le menu.</p>
        <Link href="/" className="inline-block mt-6 sm:mt-8 bg-walmart-blue text-white px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base">Retour à la boutique</Link>
      </main>
    )
  }

  // ==========================================
  // ÉCRAN DE CAISSE (CHECKOUT)
  // ==========================================
  return (
    <main className="max-w-5xl mx-auto px-4 py-6 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        <div className="space-y-4 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Informations de livraison</h2>
          <form id="checkout-form" onSubmit={handleSubmit} className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input required name="full_name" type="text" defaultValue={userProfile?.full_name || ''} className={inputClasses} placeholder="Jean Dupont" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required name="email" type="email" className={inputClasses} placeholder="jean@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input required name="phone" type="tel" defaultValue={userProfile?.phone || ''} className={inputClasses} placeholder="Ex: 07 00 00 00 00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse précise</label>
              <input required name="address" type="text" defaultValue={userProfile?.address || ''} className={inputClasses} placeholder="Quartier, Rue, Maison..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input required name="city" type="text" defaultValue={userProfile?.city || ''} className={inputClasses} placeholder="Ex: Abidjan, Dakar..." />
            </div>

            {/* SECTION CRÉATION DE COMPTE OPTIONNELLE (Visible uniquement pour les invités) */}
            {!userProfile && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Créer un compte (Optionnel)</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">Gagnez du temps pour vos prochains achats et suivez vos commandes facilement en choisissant un mot de passe.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input name="password" type="password" className={inputClasses} placeholder="Minimum 6 caractères" minLength={6} />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* RÉSUMÉ ET PAIEMENT */}
        <div className="space-y-4 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Résumé du paiement</h2>
          <div className="bg-walmart-darkBlue text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-6">
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.product_id} className="flex justify-between text-xs sm:text-sm opacity-80">
                  <span>{item.quantity}x {item.title}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} F</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 pt-3 sm:pt-4 flex justify-between items-center text-lg sm:text-xl font-bold">
              <span>Total à payer</span>
              <span>{cartTotal.toLocaleString()} XOF</span>
            </div>
            <div className="bg-white/10 p-3 sm:p-4 rounded-xl text-xs sm:text-sm">
              <p className="flex items-center gap-2">
                <span>ℹ️</span> Paiement à la livraison ou via Mobile Money lors de la réception.
              </p>
            </div>
            <button form="checkout-form" disabled={isSubmitting} className="w-full bg-white text-walmart-darkBlue py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50">
              {isSubmitting ? "Traitement..." : "Confirmer ma commande 🚀"}
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}