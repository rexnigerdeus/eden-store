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
  
  // Statuts traduits (Style Brutaliste)
  const statusLabels: Record<string, { text: string, color: string }> = {
    unpaid: { text: "Paiement requis", color: "bg-red-50 text-red-600 border-red-600" },
    pending_verification: { text: "Vérification en cours", color: "bg-gray-100 text-black border-black" },
    active: { text: "Actif", color: "bg-green-50 text-green-600 border-green-600" },
    expired: { text: "Expiré", color: "bg-red-50 text-red-600 border-red-600" }
  }

  const currentStatus = statusLabels[shop?.subscription_status || 'unpaid']

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-montserrat font-black text-black uppercase tracking-tight">Abonnement & Facturation</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Gérez votre accès à la marketplace.</p>
        </div>
        <div className={`w-full sm:w-auto text-center px-4 py-2 border-2 font-black uppercase tracking-widest text-[10px] sm:text-xs ${currentStatus.color}`}>
          STATUT : {currentStatus.text}
        </div>
      </div>

      {/* Message si compte actif */}
      {shop?.subscription_status === 'active' && (
        <div className="bg-green-50 border-2 border-green-600 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-3xl text-green-600">✓</span>
          <div>
            <h3 className="text-sm font-montserrat font-black uppercase tracking-widest text-green-800 mb-1">Votre boutique est en ligne !</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-green-700 leading-relaxed">Votre abonnement est actif. Vous pouvez recevoir des commandes.</p>
            {shop?.subscription_end_date && (
              <p className="text-[10px] font-black font-mono text-green-800 mt-2">
                VALABLE JUSQU'AU : {new Date(shop.subscription_end_date).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Zone de paiement (Visible si non payé, expiré ou en attente) */}
      {shop?.subscription_status !== 'active' && (
        <div className="bg-white border-2 border-black">
          
          {/* Tarifs */}
          <div className="p-6 md:p-10 border-b-2 border-black bg-gray-50">
            <h2 className="text-lg md:text-xl font-montserrat font-black uppercase tracking-widest text-black mb-8">
              Choisissez votre formule ({isPartner ? 'Tarif Partenaire' : 'Tarif Standard'})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Carte Mensuel */}
              <div className="bg-white p-6 border-2 border-gray-200 hover:border-black transition-colors">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Mensuel</h3>
                <p className="text-3xl md:text-4xl font-montserrat font-black text-black mt-2 mb-6">{monthlyPrice} <span className="text-xs font-bold text-gray-400 tracking-widest">/ MOIS</span></p>
                <ul className="space-y-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black">
                  <li className="flex items-center gap-3"><span className="text-green-500 text-base">✓</span> Boutique en ligne 24/7</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-base">✓</span> Gestion des commandes</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-base">✓</span> Sans engagement</li>
                </ul>
              </div>

              {/* Carte Annuel */}
              <div className="bg-black text-white p-6 border-2 border-black relative">
                <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 border-b-2 border-l-2 border-black">
                  ÉCONOMISEZ
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Annuel</h3>
                <p className="text-3xl md:text-4xl font-montserrat font-black text-white mt-2 mb-6">{annualPrice} <span className="text-xs font-bold text-gray-500 tracking-widest">/ AN</span></p>
                <ul className="space-y-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white">
                  <li className="flex items-center gap-3"><span className="text-green-500 text-base">✓</span> Tous les avantages mensuels</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-base">✓</span> Économie sur l'année</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-base">✓</span> Visibilité boostée</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Instructions de paiement */}
          <div className="p-6 md:p-10">
            <h3 className="text-sm font-montserrat font-black uppercase tracking-widest text-black mb-4">Instructions de paiement</h3>
            <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
              <ol className="list-decimal list-inside space-y-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600 leading-relaxed">
                <li>Effectuez le transfert via <strong className="text-black">Wave</strong> au <span className="text-black bg-gray-200 px-2 py-0.5 font-mono">01 02 03 04 05</span> ou <strong className="text-black">Orange Money</strong> au <span className="text-black bg-gray-200 px-2 py-0.5 font-mono">07 08 09 10 11</span>.</li>
                <li>Mettez le <strong className="text-black">nom de votre boutique</strong> en motif du transfert.</li>
                <li>Cliquez sur le bouton ci-dessous pour nous notifier de votre paiement.</li>
              </ol>
            </div>

            {shop?.subscription_status === 'pending_verification' ? (
              <div className="text-center p-6 border-2 border-black bg-gray-100 text-xs sm:text-sm font-black uppercase tracking-widest text-black">
                ⏳ Nous vérifions votre paiement. Votre compte sera activé sous peu.
              </div>
            ) : (
              <form action={notifyPaymentMade}>
                <button type="submit" className="w-full py-5 bg-black text-white font-montserrat font-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors border-2 border-black">
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