import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// --- DÉFINITION DES TARIFS DE TA PLATEFORME (À MODIFIER SELON TES PRIX) ---
const PRICE_STANDARD_MONTHLY = 5000; // 5 000 FCFA / mois
const PRICE_PARTNER_MONTHLY = 10000; // 10 000 FCFA / mois

export default async function AdminOverviewPage() {
  
  // 1. Récupération des profils
  const { count: usersCount } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 2. Récupération de TOUTES les boutiques et calcul des REVENUS PLATEFORME
  const { data: shops } = await supabaseAdmin
    .from('shops')
    .select('id, subscription_status, subscription_tier')

  const totalShops = shops?.length || 0
  const pendingShops = shops?.filter(s => s.subscription_status === 'pending_verification').length || 0
  const activeShops = shops?.filter(s => s.subscription_status === 'active').length || 0

  // Calcul du Revenu Mensuel de la plateforme (Abonnements actifs)
  let platformMonthlyRevenue = 0
  shops?.forEach(shop => {
    if (shop.subscription_status === 'active') {
      if (shop.subscription_tier === 'partner') {
        platformMonthlyRevenue += PRICE_PARTNER_MONTHLY
      } else {
        platformMonthlyRevenue += PRICE_STANDARD_MONTHLY
      }
    }
  })

  // 3. Récupération des commandes pour le VOLUME D'AFFAIRES (Ventes Vendeurs)
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, status, created_at, customer_name, shops(name)')
    .order('created_at', { ascending: false })

  const totalOrders = orders?.length || 0
  
  // Calcul du Volume d'Affaires Global (GMV)
  const globalVolume = orders?.reduce((sum, order) => {
    return order.status !== 'cancelled' ? sum + Number(order.total_amount) : sum
  }, 0) || 0

  const recentOrders = orders?.slice(0, 5) || []

  return (
    <div className="max-w-6xl space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble de la plateforme</h1>
        <p className="text-gray-500 mt-2">Suivez la croissance des ventes de vos vendeurs et les revenus de votre startup.</p>
      </div>

      {pendingShops > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-orange-500 text-xl">⚠️</span>
            <p className="text-orange-800 font-medium">
              Action requise : {pendingShops} paiement(s) d'abonnement en attente de validation.
            </p>
          </div>
          <Link href="/admin/subscriptions" className="text-sm font-bold text-orange-700 hover:underline">
            Aller valider &rarr;
          </Link>
        </div>
      )}

      {/* --- NOUVELLE DISPOSITION DES KPIs --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 : Revenus Plateforme (Ton argent) */}
        <div className="bg-gradient-to-br from-walmart-darkBlue to-walmart-blue p-6 rounded-2xl border border-blue-900 shadow-md transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl">💎</div>
            <h3 className="text-blue-100 font-medium text-sm">Revenus EDEN store / Mois</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(platformMonthlyRevenue)}
          </p>
        </div>

        {/* KPI 2 : Volume d'affaires (Argent des vendeurs) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">📈</div>
            <h3 className="text-gray-500 font-medium text-sm">Ventes Vendeurs (GMV)</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(globalVolume)}
          </p>
        </div>

        {/* KPI 3 : Boutiques */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl">🏪</div>
            <h3 className="text-gray-500 font-medium text-sm">Boutiques actives</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {activeShops} <span className="text-sm text-gray-400 font-normal">/ {totalShops}</span>
          </p>
        </div>

        {/* KPI 4 : Utilisateurs */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">👥</div>
            <h3 className="text-gray-500 font-medium text-sm">Comptes utilisateurs</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{usersCount || 0}</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Colonne de gauche : Activité des ventes (Prend plus de place) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Dernières transactions (Vendeurs)</h2>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      A acheté chez <span className="font-medium text-walmart-darkBlue">
                        {(order.shops as any)?.name || (order.shops as any)?.[0]?.name}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="font-bold text-gray-900">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(order.total_amount)}
                    </p>
                    <span className={`text-xs mt-1 px-2 py-1 rounded-full font-medium w-fit ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {order.status === 'pending' ? 'En attente' : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Aucune commande n'a encore été passée.
            </div>
          )}
        </div>

        {/* Colonne de droite : Info Abonnements */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Tarification active</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Abonnement Standard</p>
              <p className="text-xl font-bold text-gray-900">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(PRICE_STANDARD_MONTHLY)} <span className="text-sm font-normal text-gray-500">/mois</span></p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Abonnement Partenaire</p>
              <p className="text-xl font-bold text-gray-900">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(PRICE_PARTNER_MONTHLY)} <span className="text-sm font-normal text-gray-500">/mois</span></p>
            </div>
            <div className="pt-6">
               <Link href="/admin/shops" className="block w-full py-3 text-center bg-gray-50 text-walmart-blue font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                Gérer les vendeurs
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}