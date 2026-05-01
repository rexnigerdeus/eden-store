import { createClient } from '@/utils/supabase/server'
import OrderStatusDropdown from './OrderStatusDropdown'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Récupérer l'ID de la boutique du vendeur
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('seller_id', user.id)
    .single()

  let orders = []

  // 2. Si la boutique existe, récupérer ses commandes avec les articles associés
  if (shop) {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price_at_time,
          products (title, cover_image_url)
        )
      `)
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false }) // Les plus récentes en premier
      
    if (data) orders = data
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-walmart-darkBlue">Gestion des commandes</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Traitez vos commandes et mettez à jour leur statut pour vos clients.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-6 sm:p-12 rounded-xl border border-gray-100 shadow-sm text-center">
          <span className="text-4xl sm:text-5xl block mb-3 sm:mb-4">🛒</span>
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">Aucune commande pour le moment</h3>
          <p className="text-sm sm:text-base text-gray-500">Vos futures ventes apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              
              {/* En-tête de la commande */}
              <div className="bg-gray-50 p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Commande du {new Date(order.created_at).toLocaleDateString('fr-FR')} à {new Date(order.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-[10px] sm:text-xs font-mono text-gray-500 mt-1">Réf: {order.id}</p>
                </div>
                
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3 sm:gap-4 mt-2 md:mt-0">
                  <span className="font-bold text-base sm:text-lg text-walmart-blue">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(order.total_amount)}
                  </span>
                  {/* NOTRE COMPOSANT DE STATUT */}
                  <OrderStatusDropdown orderId={order.id} initialStatus={order.status} />
                </div>
              </div>

              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                
                {/* Infos du client */}
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">Client & Livraison</h4>
                  <div className="text-gray-900 space-y-1 text-xs sm:text-sm">
                    <p className="font-semibold text-sm sm:text-base">{order.customer_name}</p>
                    <p>📞 {order.customer_phone}</p>
                    <p>📍 {order.customer_address}, {order.customer_city}</p>
                  </div>
                  
                  {/* Bouton WhatsApp rapide pour le vendeur */}
                  <a 
                    href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=Bonjour ${order.customer_name}, je suis le vendeur de la boutique EDEN store. Je vous contacte concernant votre commande.`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-[#25D366] hover:underline"
                  >
                    <span>💬 Contacter le client sur WhatsApp</span>
                  </a>
                </div>

                {/* Articles de la commande */}
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">Articles ({order.order_items.length})</h4>
                  <div className="space-y-3 sm:space-y-4">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.products?.cover_image_url ? (
                            <img src={item.products.cover_image_url} alt="Produit" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] sm:text-xs">📷</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 sm:line-clamp-1">
                            {item.products?.title || 'Produit supprimé'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-0">Qté: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}