import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PRICE_STANDARD_MONTHLY = 5000;
const PRICE_PARTNER_MONTHLY = 10000;

export default async function AdminOverviewPage() {
  
  const { count: usersCount } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: shops } = await supabaseAdmin
    .from('shops')
    .select('id, subscription_status, subscription_tier')

  const totalShops = shops?.length || 0
  const pendingShops = shops?.filter(s => s.subscription_status === 'pending_verification').length || 0
  const activeShops = shops?.filter(s => s.subscription_status === 'active').length || 0

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

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, status, created_at, customer_name, shops(name)')
    .order('created_at', { ascending: false })

  const totalOrders = orders?.length || 0
  
  const globalVolume = orders?.reduce((sum, order) => {
    return order.status !== 'cancelled' ? sum + Number(order.total_amount) : sum
  }, 0) || 0

  const recentOrders = orders?.slice(0, 5) || []

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      
      {/* EN-TÊTE */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">Supervision</h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Analyse des performances de la plateforme en temps réel.</p>
      </div>

      {/* ALERTE DE PAIEMENT */}
      {pendingShops > 0 && (
        <div className="bg-red-600 text-white p-6 border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-200 mb-1">ACTION REQUISE IMMÉDIATE</span>
            <p className="font-bold text-sm sm:text-base uppercase tracking-wider">
              {pendingShops} paiement(s) d'abonnement en attente de validation.
            </p>
          </div>
          <Link href="/admin/subscriptions" className="shrink-0 px-6 py-3 bg-black text-white font-montserrat font-black text-xs uppercase tracking-widest hover:bg-gray-900 border border-black transition-colors">
            Traiter maintenant
          </Link>
        </div>
      )}

      {/* GRILLE DES KPI BRUTALISTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-black text-white p-6 md:p-8 border-2 border-black">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/20 pb-2">Revenus Plateforme / Mois</h3>
          <p className="text-3xl lg:text-4xl font-montserrat font-black">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(platformMonthlyRevenue)}
          </p>
        </div>

        <div className="bg-white text-black p-6 md:p-8 border-2 border-black">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Ventes Vendeurs (GMV)</h3>
          <p className="text-3xl lg:text-4xl font-montserrat font-black text-red-600">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(globalVolume)}
          </p>
        </div>

        <div className="bg-white text-black p-6 md:p-8 border-2 border-black">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Boutiques Actives</h3>
          <p className="text-3xl lg:text-4xl font-montserrat font-black">
            {activeShops} <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">/ {totalShops} TOTAL</span>
          </p>
        </div>

        <div className="bg-white text-black p-6 md:p-8 border-2 border-black">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Comptes Utilisateurs</h3>
          <p className="text-3xl lg:text-4xl font-montserrat font-black">{usersCount || 0}</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* JOURNAL DES TRANSACTIONS */}
        <div className="lg:col-span-2 bg-white border-2 border-black flex flex-col">
          <div className="p-6 border-b-2 border-black bg-gray-50">
            <h2 className="text-sm font-montserrat font-black text-black uppercase tracking-widest">Journal des transactions (Vendeurs)</h2>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="divide-y-2 divide-gray-100 flex-1">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                  <div>
                    <p className="font-bold text-sm text-black uppercase tracking-widest">{order.customer_name}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                      Achat chez : <span className="text-black">{(order.shops as any)?.name || (order.shops as any)?.[0]?.name}</span>
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="font-montserrat font-black text-lg text-red-600">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(order.total_amount)}
                    </p>
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-2 px-2 py-1 border ${
                      order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-600' :
                      order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-600' :
                      'bg-white text-black border-black'
                    }`}>
                      {order.status === 'pending' ? 'En attente' : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest flex-1 flex items-center justify-center">
              Le journal des transactions est vide.
            </div>
          )}
        </div>

        {/* TARIFICATION ET GESTION */}
        <div className="bg-gray-50 border-2 border-black flex flex-col">
          <div className="p-6 border-b-2 border-black bg-black text-white">
            <h2 className="text-sm font-montserrat font-black uppercase tracking-widest">Barème Plateforme</h2>
          </div>
          <div className="p-6 md:p-8 space-y-8 flex-1 flex flex-col">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Abonnement Standard</p>
              <p className="text-2xl font-montserrat font-black text-black border-b border-gray-200 pb-4">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(PRICE_STANDARD_MONTHLY)} <span className="text-xs font-bold text-gray-400 tracking-widest">/ MOIS</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Abonnement Partenaire</p>
              <p className="text-2xl font-montserrat font-black text-black">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(PRICE_PARTNER_MONTHLY)} <span className="text-xs font-bold text-gray-400 tracking-widest">/ MOIS</span>
              </p>
            </div>
            <div className="mt-auto pt-8">
               <Link href="/admin/shops" className="block w-full py-4 text-center bg-white text-black font-montserrat font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors border-2 border-black">
                Gérer les vendeurs
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}