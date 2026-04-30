import { createClient } from '@/utils/supabase/server'
import { notifyPaymentMade } from './actions'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let shop = null

  if (user) {
    const { data } = await supabase.from('shops').select('*').eq('seller_id', user.id).single()
    shop = data
  }

  // Constantes de prix basées sur le statut (Standard par défaut)
  const isPartner = shop?.subscription_tier === 'partner'
  const monthlyPrice = isPartner ? "5 000 FCFA" : "10 000 FCFA"
  const annualPrice = isPartner ? "60 000 FCFA" : "100 000 FCFA"
  
  // Statuts traduits
  const statusLabels: Record<string, { text: string, color: string }> = {
    unpaid: { text: "Paiement requis", color: "bg-red-100 text-red-800" },
    pending_verification: { text: "Vérification en cours", color: "bg-orange-100 text-orange-800" },
    active: { text: "Actif", color: "bg-green-100 text-green-800" },
    expired: { text: "Expiré", color: "bg-red-100 text-red-800" }
  }

  const currentStatus = statusLabels[shop?.subscription_status || 'unpaid']

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-walmart-darkBlue">Abonnement & Facturation</h1>
          <p className="text-gray-500 mt-1">Gérez votre accès à la marketplace Asim.</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-semibold text-sm ${currentStatus.color}`}>
          Statut : {currentStatus.text}
        </div>
      </div>

      {/* Message si compte actif */}
      {shop?.subscription_status === 'active' && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl flex items-center">
          <span className="text-3xl mr-4">🎉</span>
          <div>
            <h3 className="text-lg font-medium text-green-900">Votre boutique est en ligne !</h3>
            <p className="text-green-700">Votre abonnement est actif. Vous pouvez recevoir des commandes.</p>
            {shop?.subscription_end_date && (
              <p className="text-sm font-medium text-green-800 mt-2">
                Valable jusqu'au : {new Date(shop.subscription_end_date).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Zone de paiement (Visible si non payé, expiré ou en attente) */}
      {shop?.subscription_status !== 'active' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Tarifs */}
          <div className="p-8 border-b border-gray-100 bg-walmart-light">
            <h2 className="text-xl font-semibold text-walmart-darkBlue mb-6">
              Choisissez votre formule ({isPartner ? 'Tarif Partenaire' : 'Tarif Standard'})
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-walmart-blue transition-colors shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">Mensuel</h3>
                <p className="text-3xl font-bold text-walmart-blue mt-4">{monthlyPrice} <span className="text-sm text-gray-500 font-normal">/ mois</span></p>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li>✓ Boutique en ligne 24/7</li>
                  <li>✓ Gestion des commandes</li>
                  <li>✓ Sans engagement</li>
                </ul>
              </div>

              <div className="bg-walmart-darkBlue text-white p-6 rounded-xl border-2 border-walmart-yellow shadow-lg relative">
                <div className="absolute top-0 right-0 bg-walmart-yellow text-walmart-darkBlue text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  ÉCONOMISEZ
                </div>
                <h3 className="text-lg font-medium">Annuel</h3>
                <p className="text-3xl font-bold text-walmart-yellow mt-4">{annualPrice} <span className="text-sm text-white/70 font-normal">/ an</span></p>
                <ul className="mt-6 space-y-3 text-sm text-gray-300">
                  <li>✓ Tous les avantages mensuels</li>
                  <li>✓ Économie sur l'année</li>
                  <li>✓ Visibilité boostée</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Instructions de paiement */}
          <div className="p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Instructions de paiement</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <ol className="list-decimal list-inside space-y-4 text-gray-700">
                <li>Effectuez le transfert du montant choisi via <strong>Wave</strong> au <span className="font-bold text-blue-600">01 02 03 04 05</span> ou <strong>Orange Money</strong> au <span className="font-bold text-orange-500">07 08 09 10 11</span>.</li>
                <li>Mettez le nom de votre boutique en motif du transfert.</li>
                <li>Cliquez sur le bouton ci-dessous pour nous notifier de votre paiement.</li>
              </ol>
            </div>

            {shop?.subscription_status === 'pending_verification' ? (
              <div className="text-center p-4 bg-orange-50 text-orange-800 rounded-lg font-medium">
                ⏳ Nous vérifions votre paiement. Votre compte sera activé sous peu.
              </div>
            ) : (
              <form action={notifyPaymentMade}>
                <button type="submit" className="w-full py-4 bg-walmart-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                  J'ai effectué mon transfert Mobile Money
                </button>
              </form>
            )}
          </div>

        </div>
      )}

    </div>
  )
}