'use client'

import { useCart } from '@/context/CartContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { placeOrder } from './actions'
import Link from 'next/link'
import PasswordInput from '@/components/PasswordInput'

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

  // NOUVEAU STYLE DES INPUTS : Brut, carré, majuscule, très lisible
  const inputClasses = "w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors"

  // ==========================================
  // ÉCRAN DE SUCCÈS (Style Facture E-commerce)
  // ==========================================
  if (successOrders) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="w-20 h-20 bg-black text-white flex items-center justify-center mx-auto text-4xl mb-8">✓</div>
        <h1 className="text-3xl sm:text-5xl font-montserrat font-black uppercase tracking-tight text-black mb-4">Commande Confirmée</h1>
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-12">Merci pour votre achat. Voici vos numéros de suivi :</p>
        
        <div className="bg-gray-50 border-2 border-black p-6 text-left space-y-4 mb-12">
          {successOrders.map((order, i) => (
            <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-200 last:border-0 gap-2">
              <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Vendeur : <span className="text-black">{order.shop_name}</span></span>
              <span className="font-mono font-bold text-black text-sm bg-gray-200 px-3 py-1 select-all cursor-pointer" title="Double-cliquez pour copier">
                {order.id}
              </span>
            </div>
          ))}
        </div>
        
        <Link href="/" className="inline-block w-full sm:w-auto px-10 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest border-2 border-black hover:bg-gray-900 transition-colors">
          Retourner au catalogue
        </Link>
      </main>
    )
  }

  // ==========================================
  // ÉCRAN DE CAISSE (CHECKOUT)
  // ==========================================
  return (
    <main className="max-w-[1400px] mx-auto px-4 py-8 sm:py-16">
      
      <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight mb-8 md:mb-12 border-b border-gray-200 pb-4">
        Validation
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* COLONNE GAUCHE : Formulaire de livraison */}
        <div className="flex-1">
          <h2 className="text-lg font-montserrat font-black uppercase tracking-widest text-black mb-6">1. Adresse de livraison</h2>
          
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Nom complet *</label>
                <input required name="full_name" type="text" defaultValue={userProfile?.full_name || ''} className={inputClasses} placeholder="Ex: Jean Dupont" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email *</label>
                <input required name="email" type="email" className={inputClasses} placeholder="jean@email.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Téléphone *</label>
                <input required name="phone" type="tel" defaultValue={userProfile?.phone || ''} className={inputClasses} placeholder="Ex: 07 00 00 00 00" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Ville / Commune *</label>
                <input required name="city" type="text" defaultValue={userProfile?.city || ''} className={inputClasses} placeholder="Ex: Abidjan, Cocody..." />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Adresse précise *</label>
              <input required name="address" type="text" defaultValue={userProfile?.address || ''} className={inputClasses} placeholder="Quartier, Rue, Bâtiment..." />
            </div>

            {/* SECTION CRÉATION DE COMPTE OPTIONNELLE */}
            {!userProfile && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-lg font-montserrat font-black uppercase tracking-widest text-black mb-2">2. Créer un compte (Optionnel)</h2>
                <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider">Suivez vos commandes plus rapidement la prochaine fois.</p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Mot de passe</label>
                  <PasswordInput
                    name="password"
                    placeholder="Minimum 6 caractères"
                    minLength={6}
                    inputClassName="p-4 border-2 border-gray-300 focus:border-black"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* COLONNE DROITE : Résumé de la commande */}
        <div className="w-full lg:w-[450px] shrink-0">
          <div className="bg-gray-50 p-6 md:p-8 border-2 border-black sticky top-24">
            <h2 className="text-lg font-montserrat font-black uppercase tracking-widest text-black mb-6 border-b border-gray-200 pb-4">
              Résumé de la commande
            </h2>
            
            {/* Liste des articles simplifiée */}
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={`${item.product_id}-${item.shop_id}`} className="flex justify-between items-center text-sm font-bold uppercase tracking-wide">
                  <span className="text-gray-500 max-w-[200px] truncate">{item.quantity}x {item.title}</span>
                  <span className="text-black shrink-0">{(item.price * item.quantity).toLocaleString()} F</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6 text-sm font-bold uppercase tracking-wide border-t border-gray-200 pt-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{cartTotal.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="text-xs text-gray-400 normal-case italic font-normal">À régler à la réception</span>
              </div>
            </div>

            <div className="border-t border-black pt-4 mb-8 flex justify-between items-center text-black">
              <span className="font-bold text-sm uppercase tracking-widest">Total à payer</span>
              <span className="text-2xl font-montserrat font-black text-red-600">
                {cartTotal.toLocaleString()} XOF
              </span>
            </div>

            <div className="bg-white border border-gray-200 p-4 mb-8 flex items-start gap-3">
              <span className="text-xl">💳</span>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                Le paiement s'effectuera en espèces ou via Mobile Money directement à la livraison.
              </p>
            </div>

            <button 
              form="checkout-form" 
              disabled={isSubmitting} 
              className="w-full bg-black text-white py-5 font-montserrat font-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-all border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Traitement en cours..." : "Confirmer la commande"}
            </button>
            
            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mt-6">
              🔒 Vos données sont sécurisées
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}