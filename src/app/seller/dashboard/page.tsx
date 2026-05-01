import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function DashboardOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Récupération du profil (pour le prénom) et de la boutique
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const { data: shop } = await supabase.from('shops').select('*').eq('seller_id', user.id).single()

  // 🚨 CORRECTIF : Si la boutique n'existe pas encore, on affiche l'écran de création
  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <span className="text-5xl block mb-4">🏪</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue !</h1>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            Votre compte vendeur est créé. Il ne vous reste plus qu'à configurer votre boutique pour commencer à vendre vos articles.
          </p>
          {/* Note : Assurez-vous que ce lien correspond à votre vraie page de création de boutique */}
          <Link href="/seller/dashboard/settings" className="block w-full py-3 bg-walmart-darkBlue text-white font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-sm">
            Créer ma boutique
          </Link>
        </div>
      </div>
    )
  }

  // ⬇️ À partir d'ici, on est absolument SÛR que `shop` existe. ⬇️

  let totalRevenue = 0
  let totalOrdersCount = 0
  let pendingOrdersCount = 0
  let productsCount = 0
  let recentOrders: any[] = []

  // A. Récupérer toutes les commandes de la boutique
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at, customer_name')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  if (orders) {
    totalOrdersCount = orders.length
    recentOrders = orders.slice(0, 3) // Les 3 dernières commandes pour l'aperçu

    orders.forEach(order => {
      // On additionne le chiffre d'affaires (sauf commandes annulées)
      if (order.status !== 'cancelled') {
        totalRevenue += Number(order.total_amount)
      }
      // On compte celles qui attendent une action
      if (order.status === 'pending') {
        pendingOrdersCount += 1
      }
    })
  }

  // B. Compter les produits
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop.id)
  
  productsCount = count || 0

  const firstName = profile?.full_name?.split(' ')[0] || 'Vendeur'

  // C. Récupérer les données sociales (Abonnés, Avis, Favoris)
  const { data: followers } = await supabase
    .from('subscriptions')
    .select('created_at, profiles(full_name, avatar_url)')
    .eq('shop_id', shop.id)

  const { data: myReviews } = await supabase
    .from('reviews')
    .select('*, products(title), profiles(full_name)')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  const { data: topFavorites } = await supabase
    .from('products')
    .select('title, favorites(count)')
    .eq('shop_id', shop.id)

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      
      {/* En-tête de bienvenue */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-walmart-darkBlue">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
            Voici un résumé de l'activité de votre boutique <strong className="text-gray-900">{shop.name}</strong> aujourd'hui.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-3 mt-2 md:mt-0">
          <Link href="/seller/dashboard/products/new" className="w-full sm:w-auto text-center px-4 sm:px-6 py-2.5 sm:py-2 bg-walmart-yellow text-walmart-darkBlue font-semibold text-sm sm:text-base rounded-lg hover:bg-yellow-400 transition-colors shadow-sm">
            + Nouvel Article
          </Link>
          <a href={shop.slug ? `/shop/${shop.slug}` : '#'} target="_blank" className="w-full sm:w-auto text-center px-4 sm:px-6 py-2.5 sm:py-2 bg-gray-100 text-gray-700 font-semibold text-sm sm:text-base rounded-lg hover:bg-gray-200 transition-colors">
            Voir ma vitrine
          </a>
        </div>
      </div>

      {/* Si l'abonnement n'est pas actif, on affiche une petite alerte */}
      {shop.subscription_status !== 'active' && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-start sm:items-center space-x-3">
            <span className="text-orange-500 text-xl mt-0.5 sm:mt-0">⚠️</span>
            <p className="text-orange-800 font-medium text-xs sm:text-sm">
              Votre boutique n'est pas complètement active. Vérifiez votre abonnement pour recevoir de nouvelles commandes.
            </p>
          </div>
          <Link href="/seller/dashboard/billing" className="text-xs sm:text-sm font-bold text-orange-700 hover:underline shrink-0">
            Gérer mon abonnement &rarr;
          </Link>
        </div>
      )}

      {/* Grille des Statistiques (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Chiffre d'affaires */}
        <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-base sm:text-xl">💰</div>
            <h3 className="text-sm sm:text-base text-gray-500 font-medium">Chiffre d'affaires</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(totalRevenue)}
          </p>
        </div>

        {/* Commandes à traiter */}
        <div className={`p-5 sm:p-6 rounded-xl sm:rounded-2xl border shadow-sm transition-shadow ${pendingOrdersCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100 hover:shadow-md'}`}>
          <div className="flex items-center space-x-3 mb-3 sm:mb-4">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-xl ${pendingOrdersCount > 0 ? 'bg-orange-200 text-orange-700' : 'bg-blue-100 text-blue-600'}`}>📦</div>
            <h3 className={`text-sm sm:text-base font-medium ${pendingOrdersCount > 0 ? 'text-orange-800' : 'text-gray-500'}`}>À traiter</h3>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${pendingOrdersCount > 0 ? 'text-orange-700' : 'text-gray-900'}`}>
            {pendingOrdersCount}
          </p>
        </div>

        {/* Total Commandes */}
        <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-base sm:text-xl">🛍️</div>
            <h3 className="text-sm sm:text-base text-gray-500 font-medium">Total Commandes</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalOrdersCount}</p>
        </div>

        {/* Produits en ligne */}
        <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-base sm:text-xl">🏷️</div>
            <h3 className="text-sm sm:text-base text-gray-500 font-medium">Articles en catalogue</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{productsCount}</p>
        </div>

      </div>

      {/* Section : Dernières commandes rapides */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-walmart-darkBlue">Commandes récentes</h2>
          <Link href="/seller/dashboard/orders" className="text-xs sm:text-sm font-medium text-walmart-blue hover:underline">
            Tout voir &rarr;
          </Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-sm sm:text-base text-gray-900">{order.customer_name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')} • {order.status === 'pending' ? 'En attente' : order.status === 'delivered' ? 'Livrée' : 'En cours'}</p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto">
                  <p className="font-bold text-sm sm:text-base text-walmart-blue">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(order.total_amount)}
                  </p>
                  <Link href="/seller/dashboard/orders" className="text-xs sm:text-sm font-medium text-gray-400 hover:text-gray-900">
                    Gérer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 sm:p-8 text-center text-gray-500 text-xs sm:text-sm">
            Vos dernières commandes apparaîtront ici.
          </div>
        )}
      </div>

      {/* SECTION STATISTIQUES SOCIALES DU VENDEUR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
        
        {/* 1. TOP PRODUITS LIKÉS */}
        <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            ❤️ Coups de cœur
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {topFavorites?.map((item: any) => (
              <div key={item.title} className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-600 truncate mr-2 sm:mr-4">{item.title}</span>
                <span className="font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg shrink-0">
                  {item.favorites[0]?.count || 0} ❤️
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. DERNIERS ABONNÉS */}
        <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            👥 Nouveaux Abonnés ({followers?.length || 0})
          </h3>
          
          <div className="flex-1">
            {followers && followers.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {followers.slice(0, 8).map((f: any, i: number) => {
                  const initial = f.profiles?.full_name?.charAt(0)?.toUpperCase() || '?';
                  const fullName = f.profiles?.full_name || 'Client';

                  return (
                    <div 
                      key={i} 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-walmart-blue text-white flex items-center justify-center text-base sm:text-lg font-bold shadow-sm border-2 border-blue-50"
                      title={fullName}
                    >
                      {initial}
                    </div>
                  )
                })}
                
                {followers.length > 8 && (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm border-2 border-white">
                    +{followers.length - 8}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Aucun abonné pour le moment.</p>
            )}
          </div>

          <p className="text-[10px] sm:text-xs text-gray-500 italic mt-auto border-t border-gray-100 pt-3">
            Ces clients recevront vos futures annonces.
          </p>
        </div>

        {/* 3. DERNIERS AVIS REÇUS */}
        <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            ⭐ Avis récents
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {myReviews?.slice(0, 3).map((review: any) => (
              <div key={review.id} className="text-xs sm:text-sm border-b border-gray-50 pb-2 last:border-0">
                <div className="flex justify-between font-bold text-gray-800 mb-1">
                  <span>{review.profiles.full_name}</span>
                  <span className="text-yellow-500 shrink-0">{'★'.repeat(review.rating)}</span>
                </div>
                <p className="text-gray-500 line-clamp-2 sm:line-clamp-1 italic">"{review.comment}"</p>
                <p className="text-[9px] sm:text-[10px] text-walmart-blue mt-1 uppercase truncate">{review.products.title}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}