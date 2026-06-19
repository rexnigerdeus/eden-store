import { createClient } from '@/utils/supabase/server'
import PaymentProofForm from './PaymentProofForm'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let shop = null
  if (user) {
    const { data } = await supabase.from('shops').select('*').eq('seller_id', user.id).single()
    shop = data
  }

  // 1. RÉCUPÉRATION DES TARIFS DYNAMIQUES
  const { data: settings } = await supabase.from('platform_settings').select('*')
  const pricing = settings?.reduce((acc, curr) => {
    acc[curr.setting_key] = curr.setting_value
    return acc
  }, {} as Record<string, number>) || {}

  const isPartner = shop?.subscription_tier === 'partner'
  
  // Utilisation des tarifs dynamiques (avec des valeurs de secours)
  const rawMonthlyPrice = isPartner ? (pricing.partner_monthly || 5000) : (pricing.standard_monthly || 10000)
  const rawAnnualPrice = isPartner ? (pricing.partner_annual || 60000) : (pricing.standard_annual || 100000)
  
  const monthlyPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(rawMonthlyPrice)
  const annualPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(rawAnnualPrice)
  
  const statusLabels: Record<string, { text: string, color: string }> = {
    unpaid: { text: "Paiement requis", color: "bg-red-50 text-red-600 border-red-600" },
    pending_verification: { text: "Vérification en cours", color: "bg-gray-100 text-black border-black" },
    active: { text: "Actif", color: "bg-green-50 text-green-600 border-green-600" },
    expired: { text: "Expiré", color: "bg-red-50 text-red-600 border-red-600" }
  }

  // LOGIQUE INTELLIGENTE
  const now = new Date()
  const isExpired = shop?.subscription_end_date && new Date(shop.subscription_end_date) < now
  
  let computedStatus = shop?.subscription_status || 'unpaid'
  if (computedStatus === 'active' && isExpired) {
    computedStatus = 'expired'
  }

  const currentStatus = statusLabels[computedStatus]

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-montserrat font-black text-black uppercase tracking-tight">Abonnement & Facturation</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Gérez votre accès à la marketplace.</p>
        </div>
        <div className={`w-full sm:w-auto text-center px-4 py-2 border-2 font-black uppercase tracking-widest text-[10px] sm:text-xs ${currentStatus.color}`}>
          STATUT : {currentStatus.text}
        </div>
      </div>

      {computedStatus === 'active' && (
        <div className="bg-green-50 border-2 border-green-600 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-3xl text-green-600">✓</span>
          <div>
            <h3 className="text-sm font-montserrat font-black uppercase tracking-widest text-green-800 mb-1">Votre boutique est en ligne !</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-green-700 leading-relaxed">Votre abonnement est actif. Vous pouvez recevoir des commandes.</p>
            {shop?.subscription_end_date && (
              <p className="text-[10px] font-black font-mono text-green-800 mt-2 border-t border-green-200 pt-2 inline-block">
                VALABLE JUSQU'AU : {new Date(shop.subscription_end_date).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TARIFS — affichés en permanence, même pendant la période d'essai,
          afin que le vendeur puisse comparer les formules à tout moment
          (le bouton "Voir les tarifs" de la carte d'essai pointe ici). */}
      <div className="bg-white border-2 border-black">
        
        {/* Bandeau d'essai : affiché uniquement pendant les 14 jours d'essai */}
        {computedStatus === 'active' && shop?.subscription_end_date && (() => {
          const endDate = new Date(shop.subscription_end_date)
          const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          if (daysLeft > 15) return null
          return (
            <div className="p-6 md:p-8 border-b-2 border-black bg-walmart-yellow flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-2xl shrink-0" aria-hidden="true">🎁</span>
              <p className="text-xs font-bold text-black uppercase tracking-wider leading-relaxed">
                Période d'essai en cours — il vous reste <span className="font-black">{daysLeft} jour{daysLeft > 1 ? 's' : ''}</span> avant l'activation de votre abonnement ({isPartner ? 'Partenaire' : 'Standard'}).
              </p>
            </div>
          )
        })()}

        <div className="p-6 md:p-10 border-b-2 border-black bg-gray-50">
          <h2 className="text-lg md:text-xl font-montserrat font-black uppercase tracking-widest text-black mb-8">
            {isPartner ? 'Tarif Partenaire' : 'Tarif Standard'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 border-2 border-gray-200 hover:border-black transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Mensuel</h3>
              <p className="text-3xl md:text-4xl font-montserrat font-black text-black mt-2 mb-6">{monthlyPrice} <span className="text-xs font-bold text-gray-400 tracking-widest">/ MOIS</span></p>
              <ul className="space-y-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black">
                <li className="flex items-center gap-3"><span className="text-green-500 text-base">✓</span> Boutique en ligne 24/7</li>
                <li className="flex items-center gap-3"><span className="text-green-500 text-base">✓</span> Gestion des commandes</li>
                <li className="flex items-center gap-3"><span className="text-green-500 text-base">✓</span> Sans engagement</li>
              </ul>
            </div>

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

        <div className="p-6 md:p-10">
          <h3 className="text-sm font-montserrat font-black uppercase tracking-widest text-black mb-4">Instructions de paiement</h3>
          <div className="bg-gray-50 border-2 border-black p-6 mb-8">
            <ol className="list-decimal list-inside space-y-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600 leading-relaxed">
              <li>Effectuez le transfert via <strong className="text-black">Wave</strong> ou <strong className="text-black">Orange Money</strong> au <span className="text-black bg-gray-200 px-2 py-0.5 font-mono">07 78 55 44 83</span>.</li>
              <li>Mettez le <strong className="text-black">nom de votre boutique</strong> en motif du transfert.</li>
              <li>Cliquez sur le bouton ci-dessous pour nous notifier de votre paiement.</li>
            </ol>
          </div>

          {computedStatus === 'pending_verification' ? (
            <div className="space-y-4">
              <div className="text-center p-6 border-2 border-black bg-gray-100 text-xs sm:text-sm font-black uppercase tracking-widest text-black">
                ⏳ Nous vérifions votre paiement. Votre compte sera activé sous peu.
              </div>
              {shop?.payment_proof_url && (
                <div className="bg-white border-2 border-black p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Capture d'écran envoyée :</p>
                  <a href={shop.payment_proof_url} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={shop.payment_proof_url}
                      alt="Preuve de paiement"
                      className="max-h-64 border-2 border-gray-200 hover:border-black transition-colors"
                    />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <PaymentProofForm />
          )}
        </div>

      </div>
    </div>
  )
}