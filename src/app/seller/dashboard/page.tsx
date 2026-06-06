import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function DashboardOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Récupération du profil et de la boutique
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const { data: shop } = await supabase.from('shops').select('*').eq('seller_id', user.id).single()

  // Si pas de boutique, invitation brutaliste à la création
  if (!shop) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 border-2 border-black text-center max-w-md w-full rounded-none">
          <h1 className="text-2xl font-montserrat font-black text-black uppercase tracking-tight mb-3">Compte Vendeur Créé</h1>
          <p className="text-gray-500 mb-8 text-sm uppercase tracking-wide leading-relaxed">
            Votre espace est prêt. Vous devez configurer l'identité de votre boutique pour commencer à référencer vos produits.
          </p>
          <Link href="/seller/dashboard/settings" className="block w-full py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors">
            Créer ma boutique
          </Link>
        </div>
      </div>
    )
  }

  let totalRevenue = 0
  let totalOrdersCount = 0
  let pendingOrdersCount = 0
  let productsCount = 0
  let recentOrders: any[] = []

  // Récupérer les commandes
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at, customer_name')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  if (orders) {
    totalOrdersCount = orders.length
    recentOrders = orders.slice(0, 3)

    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        totalRevenue += Number(order.total_amount)
      }
      if (order.status === 'pending') {
        pendingOrdersCount += 1
      }
    })
  }

  // Compter les produits
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop.id)
  
  productsCount = count || 0

  const firstName = profile?.full_name?.split(' ')[0] || 'Vendeur'

  // Données sociales
  const { data: followers } = await supabase.from('subscriptions').select('created_at, profiles(full_name)').eq('shop_id', shop.id)
  const { data: myReviews } = await supabase.from('reviews').select('*, products(title), profiles(full_name)').eq('shop_id', shop.id).order('created_at', { ascending: false })
  const { data: topFavorites } = await supabase.from('products').select('title, favorites(count)').eq('shop_id', shop.id)

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      
      {/* 1. EN-TÊTE DE BIENVENUE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl font-montserrat font-black text-black uppercase tracking-tight">
            PROFIL / {firstName}
          </h1>
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mt-2">
            Espace d'administration de la vitrine : <span className="text-black">{shop.name}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Nouveau produit : bouton en rouge promo éclatant */}
          <Link href="/seller/dashboard/products/new" className="w-full sm:w-auto text-center px-6 py-4 bg-red-600 text-white font-montserrat font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
            + Ajouter un article
          </Link>
          <a href={`/shop/${shop.slug}`} target="_blank" className="w-full sm:w-auto text-center px-6 py-4 bg-white text-black border-2 border-black font-montserrat font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors">
            Voir ma vitrine public
          </a>
        </div>
      </div>

      {/* 2. ALERTE ABONNEMENT INACTIF (Design Alerte Sec) */}
      {shop.subscription_status !== 'active' && (
        <div className="border-2 border-red-600 bg-red-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-none">
          <p className="text-xs font-bold text-red-700 uppercase tracking-wider leading-relaxed">
            ⚠️ STATUT EN ATTENTE : Votre boutique n'est pas publiée sur le catalogue public. Veuillez régulariser votre abonnement mensuel de 5 000 FCFA.
          </p>
          <Link href="/seller/dashboard/billing" className="text-xs font-black text-red-600 uppercase tracking-widest border-b-2 border-red-600 pb-0.5 hover:text-red-800 transition-colors shrink-0">
            Activer mon espace &rarr;
          </Link>
        </div>
      )}

      {/* 3. GRILLE DES INDICATEURS CLÉS (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chiffre d'affaires */}
        <div className="border border-gray-200 bg-white p-6">
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-3">Chiffre d'affaires total</h3>
          <p className="text-2xl font-montserrat font-black text-black">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(totalRevenue)}
          </p>
        </div>
        {/* À traiter */}
        <div className={`border p-6 ${pendingOrdersCount > 0 ? 'border-red-600 bg-red-50/50' : 'border-gray-200 bg-white'}`}>
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-3">Commandes à traiter</h3>
          <p className={`text-2xl font-montserrat font-black ${pendingOrdersCount > 0 ? 'text-red-600' : 'text-black'}`}>
            {pendingOrdersCount}
          </p>
        </div>
        {/* Total Commandes */}
        <div className="border border-gray-200 bg-white p-6">
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-3">Commandes enregistrées</h3>
          <p className="text-2xl font-montserrat font-black text-black">{totalOrdersCount}</p>
        </div>
        {/* Articles */}
        <div className="border border-gray-200 bg-white p-6">
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-3">Articles en catalogue</h3>
          <p className="text-2xl font-montserrat font-black text-black">{productsCount}</p>
        </div>
      </div>

      {/* 4. GRILLE TECHNIQUE : COMMANDES ET ANALYTICS RECENTES */}
      <div className="border border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-xs font-montserrat font-black text-black uppercase tracking-widest">Flux des commandes récentes</h2>
          <Link href="/seller/dashboard/orders" className="text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-black transition-colors underline">
            Voir le registre complet
          </Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="font-montserrat font-bold text-sm text-black uppercase tracking-wide">{order.customer_name}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')} • Status : <span className="text-black font-bold">{order.status}</span>
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-1">ID: {order.id}</p>
                </div>
                <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <p className="font-montserrat font-black text-base text-red-600">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(order.total_amount)}
                  </p>
                  <Link href="/seller/dashboard/orders" className="text-xs font-bold text-black uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-all mt-2">
                    Traiter
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
            Aucune transaction récente dans le journal.
          </div>
        )}
      </div>

      {/* 5. BLOCS ANALYTIQUES SOCIAUX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coups de cœur */}
        <div className="border border-gray-200 p-6 bg-white">
          <h3 className="text-xs font-montserrat font-black text-black uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">
            ❤️ Coups de cœur client
          </h3>
          <div className="space-y-4">
            {topFavorites?.map((item: any) => (
              <div key={item.title} className="flex justify-between items-center text-xs font-bold uppercase tracking-wide">
                <span className="text-gray-600 truncate max-w-[200px]">{item.title}</span>
                <span className="text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 font-mono text-xs shrink-0">
                  {item.favorites[0]?.count || 0} LIKES
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Abonnés */}
        <div className="border border-gray-200 p-6 bg-white flex flex-col">
          <h3 className="text-xs font-montserrat font-black text-black uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">
            👥 Abonnés Boutique ({followers?.length || 0})
          </h3>
          <div className="flex-1">
            {followers && followers.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {followers.slice(0, 6).map((f: any, i: number) => {
                  const initial = f.profiles?.full_name?.charAt(0)?.toUpperCase() || '?';
                  return (
                    <div 
                      key={i} 
                      className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-bold font-montserrat border border-black"
                      title={f.profiles?.full_name || 'Client'}
                    >
                      {initial}
                    </div>
                  )
                })}
                {followers.length > 6 && (
                  <div className="w-10 h-10 bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold font-montserrat border border-gray-200">
                    +{followers.length - 6}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Aucun abonnement pour le moment.</p>
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-4 pt-3 border-t border-gray-100 italic">
            Notifications envoyées automatiquement à ces comptes.
          </p>
        </div>

        {/* Évaluations */}
        <div className="border border-gray-200 p-6 bg-white">
          <h3 className="text-xs font-montserrat font-black text-black uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">
            ⭐ Avis et notations reçus
          </h3>
          <div className="space-y-4">
            {myReviews?.slice(0, 3).map((review: any) => (
              <div key={review.id} className="text-xs border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-center font-bold uppercase tracking-wide text-black mb-1">
                  <span>{review.profiles.full_name}</span>
                  <span className="text-red-600 font-mono">{'★'.repeat(review.rating)}</span>
                </div>
                <p className="text-gray-500 italic lowercase first-letter:uppercase">"{review.comment}"</p>
                <p className="text-[9px] text-black font-bold uppercase truncate tracking-wider mt-1">{review.products.title}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}