import { supabaseAdmin } from '@/utils/supabase/admin'
import SubscriptionControls from './SubscriptionControls'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage() {
  
  const { data: shops } = await supabaseAdmin
    .from('shops')
    .select('*')
    .order('subscription_status', { ascending: false })

  const now = new Date()

  const pendingCount = shops?.filter(s => s.subscription_status === 'pending_verification').length || 0
  const expiredCount = shops?.filter(s => s.subscription_end_date && new Date(s.subscription_end_date) < now).length || 0

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      
      {/* EN-TÊTE */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">Abonnements</h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Validez les paiements manuels et gérez les accès vendeurs.</p>
      </div>

      {/* KPI RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 border-2 border-black ${pendingCount > 0 ? 'bg-red-600 text-white' : 'bg-white text-black'}`}>
          <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 border-b pb-2 ${pendingCount > 0 ? 'border-red-400 text-red-200' : 'border-gray-200 text-gray-400'}`}>
            Vérifications en attente
          </h3>
          <p className="text-3xl font-montserrat font-black">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 border-2 border-black text-black">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 pb-2">Boutiques actives</h3>
          <p className="text-3xl font-montserrat font-black">
            {shops?.filter(s => s.subscription_status === 'active').length || 0}
          </p>
        </div>
        <div className="bg-white p-6 border-2 border-black text-black">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 pb-2">Abonnements expirés</h3>
          <p className={`text-3xl font-montserrat font-black ${expiredCount > 0 ? 'text-red-600' : 'text-black'}`}>{expiredCount}</p>
        </div>
      </div>

      {/* REGISTRE DES ABONNEMENTS */}
      <div className="bg-white border-2 border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-[10px] uppercase tracking-widest font-bold">
                <th className="p-4 sm:p-6 border-b-2 border-black">Boutique & Niveau</th>
                <th className="p-4 sm:p-6 border-b-2 border-black">Statut actuel</th>
                <th className="p-4 sm:p-6 border-b-2 border-black">Date de fin</th>
                <th className="p-4 sm:p-6 border-b-2 border-black text-right">Validation Paiement</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {shops && shops.length > 0 ? (
                shops.map((shop) => {
                  const endDate = shop.subscription_end_date ? new Date(shop.subscription_end_date) : null
                  const isExpired = endDate && endDate < now

                  return (
                    <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                      
                      <td className="p-4 sm:p-6">
                        <p className="font-montserrat font-black text-sm text-black uppercase tracking-wider mb-1">{shop.name}</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                          shop.subscription_tier === 'partner' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300'
                        }`}>
                          {shop.subscription_tier === 'partner' ? 'Partenaire' : 'Standard'}
                        </span>
                      </td>

                      <td className="p-4 sm:p-6">
                        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 border-2 ${
                          shop.subscription_status === 'pending_verification' ? 'bg-red-50 text-red-600 border-red-600 animate-pulse' :
                          shop.subscription_status === 'active' ? 'bg-green-50 text-green-600 border-green-600' :
                          shop.subscription_status === 'unpaid' ? 'bg-white text-gray-500 border-gray-300' :
                          'bg-red-50 text-red-600 border-red-600'
                        }`}>
                          {shop.subscription_status === 'pending_verification' ? 'En attente' :
                           shop.subscription_status === 'active' ? 'Actif' :
                           shop.subscription_status === 'unpaid' ? 'Non payé' : 'Expiré'}
                        </span>
                      </td>

                      <td className="p-4 sm:p-6">
                        {endDate ? (
                          <span className={`text-xs font-bold uppercase tracking-widest ${isExpired ? 'text-red-600' : 'text-black'}`}>
                            {endDate.toLocaleDateString('fr-FR')}
                            {isExpired && ' (EXPIRÉ)'}
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
  )
}