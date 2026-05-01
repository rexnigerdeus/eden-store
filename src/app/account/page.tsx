import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()

  // 1. Vérifier si l'utilisateur est connecté
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. Récupérer l'historique de SES commandes
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      shops(id, name, slug, whatsapp),
      order_items(
        quantity,
        price_at_time,
        products(title, cover_image_url)
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const statusConfig: Record<string, { label: string, color: string }> = {
    pending: { label: 'En attente', color: 'bg-orange-100 text-orange-800' },
    processing: { label: 'En préparation', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-walmart-darkBlue">Mon Espace Client</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Bonjour {profile?.full_name || user?.user_metadata?.full_name || 'Client'}, voici le récapitulatif de votre activité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          
          {/* Menu latéral (très simple pour l'instant) */}
          <div className="md:col-span-1 space-y-2">
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <Link href="/account" className="block px-3 py-2 text-sm sm:text-base bg-blue-50 text-walmart-blue font-medium rounded-lg">
                Mes commandes
              </Link>
              <Link href="/account/messages" className="block px-3 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                Mes messages
              </Link>
              <Link href="/account/favorites" className="block px-3 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                Mes favoris
              </Link>
              <Link href="/track" className="block px-3 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-50 font-medium rounded-lg mt-1 transition-colors">
                Suivi rapide (Invité)
              </Link>
            </div>
          </div>

          {/* Contenu principal : Historique des commandes */}
          <div className="md:col-span-3 space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Historique de mes commandes</h2>

            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  
                  {/* En-tête de la commande */}
                  <div className="bg-gray-50 p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Commande passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">Réf: {order.id}</p>
                    </div>
                    <div className="sm:text-right">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusConfig[order.status]?.label || order.status}
                      </span>
                    </div>
                  </div>

                  {/* Corps de la commande */}
                  <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
                    
                    {/* Liste des articles (on n'affiche que le premier pour condenser, ou on peut tous les lister) */}
                    <div className="flex-1 space-y-4">
                      {order.order_items.map((item: any) => (
                        <div key={item.id} className="flex items-start sm:items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            {item.products?.cover_image_url ? (
                              <img src={item.products.cover_image_url} alt="Produit" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2">{item.products?.title || 'Article indisponible'}</p>
                            <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Résumé et Actions */}
                    <div className="md:w-56 lg:w-64 flex-shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <div>
                        <p className="text-sm text-gray-500">Boutique :</p>
                        <Link href={`/shop/${order.shops?.slug}`} className="font-medium text-walmart-blue hover:underline">
                          {order.shops?.name}
                        </Link>
                        <p className="text-base sm:text-lg font-bold text-gray-900 mt-2">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(order.total_amount)}
                        </p>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <Link href={`/track?orderId=${order.id}&phone=${order.customer_phone}`} className="block w-full py-2 text-center text-sm font-medium bg-walmart-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Détails complets
                        </Link>
                        <Link 
                          href={`/account/messages/${order.shops?.id}`} 
                          className="block w-full py-2 text-center text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          💬 Contacter le vendeur
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
                <span className="text-4xl sm:text-5xl mb-4 block">🛍️</span>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Vous n'avez pas encore de commandes</h3>
                <Link href="/" className="text-sm sm:text-base text-walmart-blue hover:underline font-medium">
                  Commencer mes achats
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}