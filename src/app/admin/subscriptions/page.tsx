import { supabaseAdmin } from '@/utils/supabase/admin'
import SubscriptionControls from './SubscriptionControls'
import { updatePricing } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage() {
  
  // 1. Récupération des boutiques
  const { data: shops } = await supabaseAdmin
    .from('shops')
    .select('*')
    .order('subscription_status', { ascending: false })

  // 2. Récupération dynamique des prix actuels
  const { data: settings } = await supabaseAdmin.from('platform_settings').select('*')
  
  // Transformation du tableau en objet facilement lisible
  const pricing = settings?.reduce((acc, curr) => {
    acc[curr.setting_key] = curr.setting_value
    return acc
  }, {} as Record<string, number>) || {}

  const now = new Date()

  const pendingCount = shops?.filter(s => s.subscription_status === 'pending_verification').length || 0
  
  const activeCount = shops?.filter(s => {
    const isExp = s.subscription_end_date && new Date(s.subscription_end_date) < now
    return s.subscription_status === 'active' && !isExp
  }).length || 0

  const expiredCount = shops?.filter(s => {
    const isExp = s.subscription_end_date && new Date(s.subscription_end_date) < now
    return s.subscription_status === 'expired' || (s.subscription_status === 'active' && isExp)
  }).length || 0

  const inputClasses = "w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white transition-colors rounded-none"

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      
      {/* EN-TÊTE */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">Abonnements & Tarifs</h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Validez les paiements manuels et gérez les tarifs de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : KPI ET RÉGLAGES DES TARIFS */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="grid grid-cols-1 gap-4">
            <div className={`p-6 border-2 border-black ${pendingCount > 0 ? 'bg-red-600 text-white' : 'bg-white text-black'}`}>
              <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 border-b pb-2 ${pendingCount > 0 ? 'border-red-400 text-red-200' : 'border-gray-200 text-gray-400'}`}>
                Vérifications en attente
              </h3>
              <p className="text-3xl font-montserrat font-black">{pendingCount}</p>
            </div>
            <div className="bg-white p-6 border-2 border-black text-black">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 pb-2">Boutiques actives</h3>
              <p className="text-3xl font-montserrat font-black">{activeCount}</p>
            </div>
          </div>

          {/* FORMULAIRE DES TARIFS */}
          <div className="bg-gray-50 border-2 border-black p-6">
            <h2 className="text-sm font-montserrat font-black text-black uppercase tracking-widest mb-6">Barème Tarifaire</h2>
            <form action={updatePricing} className="space-y-6">
              
              <div className="space-y-4 border-b-2 border-gray-200 pb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Abonnement Standard</h3>
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1">Mensuel (FCFA)</label>
                  <input type="number" name="standard_monthly" defaultValue={pricing.standard_monthly || 10000} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1">Annuel (FCFA)</label>
                  <input type="number" name="standard_annual" defaultValue={pricing.standard_annual || 100000} className={inputClasses} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Abonnement Partenaire</h3>
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1">Mensuel (FCFA)</label>
                  <input type="number" name="partner_monthly" defaultValue={pricing.partner_monthly || 5000} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1">Annuel (FCFA)</label>
                  <input type="number" name="partner_annual" defaultValue={pricing.partner_annual || 60000} className={inputClasses} />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest text-xs hover:bg-gray-900 border-2 border-black transition-colors">
                Mettre à jour les prix
              </button>
            </form>
          </div>

        </div>

        {/* COLONNE DROITE : REGISTRE DES ABONNEMENTS */}
        <div className="lg:col-span-2 bg-white border-2 border-black overflow-hidden flex flex-col h-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-[10px] uppercase tracking-widest font-bold">
                  <th className="p-4 sm:p-6 border-b-2 border-black">Boutique & Niveau</th>
                  <th className="p-4 sm:p-6 border-b-2 border-black">Statut</th>
                  <th className="p-4 sm:p-6 border-b-2 border-black">Expiration</th>
                  <th className="p-4 sm:p-6 border-b-2 border-black text-right">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {shops && shops.length > 0 ? (
                  shops.map((shop) => {
                    const endDate = shop.subscription_end_date ? new Date(shop.subscription_end_date) : null
                    const isExpired = endDate && endDate < now

                    let computedStatus = shop.subscription_status
                    if (computedStatus === 'active' && isExpired) computedStatus = 'expired'

                    return (
                      <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                        
                        <td className="p-4 sm:p-6">
                          <p className="font-montserrat font-black text-xs sm:text-sm text-black uppercase tracking-wider mb-1 truncate max-w-[120px]">{shop.name}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                            shop.subscription_tier === 'partner' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300'
                          }`}>
                            {shop.subscription_tier === 'partner' ? 'Partenaire' : 'Standard'}
                          </span>
                        </td>

                        <td className="p-4 sm:p-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 whitespace-nowrap ${
                            computedStatus === 'pending_verification' ? 'bg-red-50 text-red-600 border-red-600 animate-pulse' :
                            computedStatus === 'active' ? 'bg-green-50 text-green-600 border-green-600' :
                            computedStatus === 'unpaid' ? 'bg-white text-gray-500 border-gray-300' :
                            'bg-red-50 text-red-600 border-red-600'
                          }`}>
                            {computedStatus === 'pending_verification' ? 'En attente' :
                             computedStatus === 'active' ? 'Actif' :
                             computedStatus === 'unpaid' ? 'Non payé' : 'Expiré'}
                          </span>
                        </td>

                        <td className="p-4 sm:p-6">
                          {endDate ? (
                            <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${isExpired ? 'text-red-600' : 'text-black'}`}>
                              {endDate.toLocaleDateString('fr-FR')}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">N/A</span>
                          )}
                        </td>

                        <td className="p-4 sm:p-6 flex justify-end">
                          <SubscriptionControls shopId={shop.id} />
                        </td>

                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-50">
                      Le registre est vide.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}