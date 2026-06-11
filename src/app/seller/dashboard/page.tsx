import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'
import { computeGhostSubscribers } from '@/utils/subscribers'

export default async function DashboardOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const { data: shop } = await supabase.from('shops').select('*').eq('seller_id', user.id).single()

  if (!shop) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 border-2 border-black text-center max-w-md w-full rounded-none">
          <h1 className="text-2xl font-montserrat font-black text-black uppercase tracking-tight mb-3">Compte Vendeur Créé</h1>
          <p className="text-gray-500 mb-8 text-sm uppercase tracking-wide leading-relaxed">
            Votre espace est prêt. Configurez l'identité de votre boutique pour commencer avec 14 jours offerts.
          </p>
          <Link href="/seller/dashboard/settings" className="block w-full py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors border-2 border-black">
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

  const { data: orders } = await supabase.from('orders').select('id, total_amount, status, created_at, customer_name').eq('shop_id', shop.id).order('created_at', { ascending: false })

  if (orders) {
    totalOrdersCount = orders.length
    recentOrders = orders.slice(0, 3)
    orders.forEach(order => {
      if (order.status !== 'cancelled') totalRevenue += Number(order.total_amount)
      if (order.status === 'pending') pendingOrdersCount += 1
    })
  }

  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id)
  productsCount = count || 0

  const firstName = profile?.full_name?.split(' ')[0] || 'Vendeur'
  
  const { data: followers } = await supabaseAdmin.from('subscriptions').select('created_at, profiles(full_name)').eq('shop_id', shop.id)
  // Calcul du total affiché : vrais abonnés + abonnés fantômes (boost interne)
  const realFollowersCount = followers?.length || 0
  const totalFollowersCount = realFollowersCount + computeGhostSubscribers(realFollowersCount)
  const { data: topFavorites } = await supabase.from('products').select('title, favorites(count)').eq('shop_id', shop.id)

  // 1. Récupération des avis avec user_id
  const { data: myReviews } = await supabaseAdmin
    .from('reviews')
    .select('*, products(title), user_id, profiles(full_name)')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  // 2. RECHERCHE MULTI-COUCHES DU NOM POUR CHAQUE AVIS DU VENDEUR
  const formattedMyReviews = await Promise.all((myReviews || []).map(async (review: any) => {
    let clientName = review.profiles?.full_name

    if (!clientName && review.user_id) {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(review.user_id)
      if (authData?.user?.user_metadata?.full_name) {
        clientName = authData.user.user_metadata.full_name
      }
    }

    if (!clientName && review.user_id) {
      const { data: orderData } = await supabaseAdmin.from('orders')
        .select('customer_name')
        .eq('customer_id', review.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (orderData?.customer_name) {
        clientName = orderData.customer_name
      }
    }

    return {
      ...review,
      profiles: {
        full_name: clientName || 'Client Inconnu'
      }
    }
  }))

  const now = new Date()
  const isExpired = shop.subscription_end_date && new Date(shop.subscription_end_date) < now
  const isReallyActive = shop.subscription_status === 'active' && !isExpired

  const shopCreatedDate = new Date(shop.created_at)
  const diffTime = Math.abs(now.getTime() - shopCreatedDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const isTrial = diffDays <= 15 && isReallyActive

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl font-montserrat font-black text-black uppercase tracking-tight">PROFIL / {firstName}</h1>
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mt-2">
            Espace d'administration de la vitrine : <span className="text-black">{shop.name}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Link href="/seller/dashboard/products/new" className="w-full sm:w-auto text-center px-6 py-4 bg-red-600 text-white font-montserrat font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors border-2 border-red-600">
            + Ajouter un article
          </Link>
          <a href={`/shop/${shop.slug}`} target="_blank" className="w-full sm:w-auto text-center px-6 py-4 bg-white text-black border-2 border-black font-montserrat font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors">
            Voir ma vitrine
          </a>
        </div>
      </div>

      {isTrial && (
        <div className="border-2 border-black bg-walmart-yellow p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-bold text-black uppercase tracking-wider leading-relaxed">
            🎁 PÉRIODE DE DÉCOUVERTE : Profitez de toutes les fonctionnalités. Votre abonnement sera requis à partir du <span className="font-black text-white bg-black px-2 py-1 ml-1">{new Date(shop.subscription_end_date).toLocaleDateString('fr-FR')}</span>.
          </p>
          <Link href="/seller/dashboard/billing" className="text-[10px] font-black text-black uppercase tracking-widest border-2 border-black px-4 py-2 hover:text-white hover:bg-black transition-all shrink-0 bg-white">
            Voir les tarifs
          </Link>
        </div>
      )}

      {!isReallyActive && (
        <div className="border-2 border-red-600 bg-red-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs font-bold text-red-700 uppercase tracking-wider leading-relaxed">
            ⚠️ {isExpired ? "ABONNEMENT EXPIRÉ" : "STATUT EN ATTENTE"} : Votre vitrine n'est plus visible par les clients. Veuillez régler votre abonnement.
          </p>
          <Link href="/seller/dashboard/billing" className="text-[10px] font-black text-white bg-red-600 uppercase tracking-widest border-2 border-red-600 px-4 py-2 hover:bg-red-800 transition-colors shrink-0">
            Régulariser
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border-2 border-black bg-white p-6">
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-3">Chiffre d'affaires total</h3>
          <p className="text-2xl font-montserrat font-black text-black">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(totalRevenue)}
          </p>
        </div>
        <div className={`border-2 p-6 ${pendingOrdersCount > 0 ? 'border-red-600 bg-red-50 text-red-600' : 'border-black bg-white text-black'}`}>
          <h3 className="text-[10px] font-montserrat font-black uppercase tracking-widest mb-3 opacity-70">Commandes à traiter</h3>
          <p className="text-2xl font-montserrat font-black">{pendingOrdersCount}</p>
        </div>
        <div className="border-2 border-black bg-white p-6">
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-3">Commandes enregistrées</h3>
          <p className="text-2xl font-montserrat font-black text-black">{totalOrdersCount}</p>
        </div>
        <div className="border-2 border-black bg-white p-6">
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-3">Articles en catalogue</h3>
          <p className="text-2xl font-montserrat font-black text-black">{productsCount}</p>
        </div>
      </div>

      <div className="border-2 border-black bg-white">
        <div className="p-4 border-b-2 border-black bg-gray-50 flex items-center justify-between">
          <h2 className="text-xs font-montserrat font-black text-black uppercase tracking-widest">Flux des commandes récentes</h2>
          <Link href="/seller/dashboard/orders" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors underline">
            Voir registre
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="divide-y-2 divide-black">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-montserrat font-black text-sm text-black uppercase tracking-wide">{order.customer_name}</p>
                  <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-widest">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')} • Status : <span className="text-black">{order.status}</span>
                  </p>
                </div>
                <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <p className="font-montserrat font-black text-base text-red-600">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(order.total_amount)}
                  </p>
                  <Link href="/seller/dashboard/orders" className="text-[10px] font-black text-black uppercase tracking-widest border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors mt-2">
                    Traiter
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Aucune transaction.</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border-2 border-black p-6 bg-white">
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-6 border-b-2 border-black pb-3">❤️ Coups de cœur</h3>
          <div className="space-y-4">
            {topFavorites?.map((item: any) => (
              <div key={item.title} className="flex justify-between items-center text-xs font-bold uppercase tracking-wide">
                <span className="text-black truncate max-w-[200px]">{item.title}</span>
                <span className="text-red-600 bg-red-50 border border-red-600 px-2 py-0.5 font-mono text-[10px] shrink-0">{item.favorites[0]?.count || 0} LIKES</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-black p-6 bg-white flex flex-col">
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-6 border-b-2 border-black pb-3">👥 Abonnés</h3>
          <div className="flex-1">
            <p className="text-3xl font-montserrat font-black text-black mb-2">
              {totalFollowersCount.toLocaleString('fr-FR')}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              {realFollowersCount > 1
                ? `${realFollowersCount} supporters de votre boutique`
                : realFollowersCount === 1
                ? '1 supporter de votre boutique'
                : 'Aucun abonné pour le moment'}
            </p>
            {followers && followers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {followers.slice(0, 6).map((f: any, i: number) => (
                  <div key={i} className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-black font-montserrat border-2 border-black" title={f.profiles?.full_name}>
                    {f.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-2 border-black p-6 bg-white">
          <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-6 border-b-2 border-black pb-3">⭐ Avis clients</h3>
          <div className="space-y-4">
            {formattedMyReviews.slice(0, 3).map((review: any) => (
              <div key={review.id} className="text-xs border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-center font-bold uppercase tracking-wide text-black mb-1">
                  <span className="text-red-600 font-mono">{review.profiles.full_name}</span>
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