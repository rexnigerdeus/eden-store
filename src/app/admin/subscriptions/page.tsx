import { supabaseAdmin } from '@/utils/supabase/admin'
import SubscriptionControls from './SubscriptionControls'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage() {
  
  // On récupère les boutiques
  const { data: shops } = await supabaseAdmin
    .from('shops')
    .select('*')
    .order('subscription_status', { ascending: false }) // Les pending en premier

  const now = new Date()

  // On compte les alertes
  const pendingCount = shops?.filter(s => s.subscription_status === 'pending_verification').length || 0
  const expiredCount = shops?.filter(s => s.subscription_end_date && new Date(s.subscription_end_date) < now).length || 0

  return (
    <div className="max-w-6xl space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Abonnements</h1>
          <p className="text-gray-500 mt-2">Gérez les paiements Wave/Orange Money et prolongez les accès de vos vendeurs.</p>
        </div>
      </div>

      {/* KPI Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 font-medium mb-2">Vérifications en attente</h3>
          <p className={`text-3xl font-bold ${pendingCount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 font-medium mb-2">Boutiques actives</h3>
          <p className="text-3xl font-bold text-green-600">
            {shops?.filter(s => s.subscription_status === 'active').length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 font-medium mb-2">Abonnements expirés</h3>
          <p className={`text-3xl font-bold ${expiredCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{expiredCount}</p>
        </div>
      </div>

      {/* Tableau des abonnements */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Boutique & Niveau</th>
                <th className="p-4 font-semibold">Statut actuel</th>
                <th className="p-4 font-semibold">Date de fin</th>
                <th className="p-4 font-semibold">Valider un paiement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shops && shops.length > 0 ? (
                shops.map((shop) => {
                  const endDate = shop.subscription_end_date ? new Date(shop.subscription_end_date) : null
                  const isExpired = endDate && endDate < now

                  return (
                    <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                      
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{shop.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${shop.subscription_tier === 'partner' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                          {shop.subscription_tier === 'partner' ? 'Partenaire' : 'Standard'}
                        </span>
                      </td>

                      <td className="p-4">
                        {shop.subscription_status === 'pending_verification' && <span className="text-orange-600 font-medium text-sm flex items-center gap-1"><span>⏳</span> En attente</span>}
                        {shop.subscription_status === 'active' && <span className="text-green-600 font-medium text-sm flex items-center gap-1"><span>✅</span> Actif</span>}
                        {shop.subscription_status === 'unpaid' && <span className="text-red-600 font-medium text-sm">Non payé</span>}
                        {shop.subscription_status === 'expired' && <span className="text-red-600 font-medium text-sm">Expiré</span>}
                      </td>

                      <td className="p-4">
                        {endDate ? (
                          <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                            {endDate.toLocaleDateString('fr-FR')}
                            {isExpired && ' (Expiré)'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Jamais abonné</span>
                        )}
                      </td>

                      <td className="p-4">
                        <SubscriptionControls shopId={shop.id} />
                      </td>

                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Aucune boutique trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}