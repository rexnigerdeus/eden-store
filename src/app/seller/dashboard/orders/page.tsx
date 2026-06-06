import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import OrderStatusDropdown from './OrderStatusDropdown'
import Link from 'next/link'

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

  // 2. Récupérer ses commandes avec les articles associés
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
      .order('created_at', { ascending: false })
      
    if (data) orders = data
  }

  // --- ACTION SERVEUR : DÉMARRER OU REJOINDRE LA DISCUSSION ---
  async function startConversation(formData: FormData) {
    'use server'
    const shopId = formData.get('shopId') as string
    const customerId = formData.get('customerId') as string

    if (!shopId || !customerId) return

    // On vérifie d'abord si une conversation existe déjà
    let { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('shop_id', shopId)
      .eq('customer_id', customerId)
      .single()

    let convId = existing?.id

    // Si elle n'existe pas, on la crée
    if (!convId) {
      const { data } = await supabaseAdmin
        .from('conversations')
        .insert({ shop_id: shopId, customer_id: customerId })
        .select('id')
        .single()
      convId = data?.id
    }

    // On redirige vers la messagerie interne de l'espace vendeur
    if (convId) {
      redirect(`/seller/dashboard/messages/${convId}`)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-montserrat font-black text-black uppercase tracking-tight">Registre des commandes</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Gérez et expédiez vos ventes</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 p-12 border-2 border-black text-center">
          <h3 className="text-xl font-montserrat font-black text-black uppercase tracking-widest mb-2">Aucune commande</h3>
          <p className="text-xs uppercase tracking-widest text-gray-500">Vos futures ventes apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white border-2 border-black flex flex-col">
              
              {/* En-tête de la commande (Bandeau Noir) */}
              <div className="bg-black p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-white">
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Date : {new Date(order.created_at).toLocaleDateString('fr-FR')} - {new Date(order.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-widest">Réf: {order.id}</p>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto mt-2 md:mt-0 border-t border-white/20 md:border-0 pt-4 md:pt-0">
                  <span className="font-montserrat font-black text-xl text-white">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(order.total_amount)}
                  </span>
                  <OrderStatusDropdown orderId={order.id} initialStatus={order.status} />
                </div>
              </div>

              {/* Corps de la facture */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                
                {/* Colonne gauche : Étiquette d'expédition */}
                <div className="md:pr-8">
                  <h4 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-4">
                    Étiquette d'expédition
                  </h4>
                  <div className="space-y-2 text-sm font-bold text-black uppercase tracking-wider">
                    <p className="text-base font-black font-montserrat mb-3">{order.customer_name}</p>
                    <p className="text-gray-600 text-xs">TEL: <span className="text-black">{order.customer_phone}</span></p>
                    <p className="text-gray-600 text-xs leading-relaxed">ADR: <span className="text-black">{order.customer_address}</span></p>
                    <p className="text-gray-600 text-xs">VIL: <span className="text-black">{order.customer_city}</span></p>
                  </div>
                  
                  {/* NOUVEAU : BOUTON DE MESSAGERIE INTERNE */}
                  <form action={startConversation} className="mt-8">
                    <input type="hidden" name="shopId" value={shop?.id} />
                    <input type="hidden" name="customerId" value={order.customer_id} />
                    <button 
                      type="submit" 
                      className="w-full md:w-auto inline-block text-center border-2 border-black px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
                    >
                      Message Interne (Client)
                    </button>
                  </form>
                </div>

                {/* Colonne droite : Liste des articles */}
                <div className="pt-8 md:pt-0 md:pl-8">
                  <h4 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-4">
                    Articles à préparer ({order.order_items.length})
                  </h4>
                  <div className="space-y-4">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-4">
                        <div className="w-16 h-20 bg-gray-100 border border-gray-200 flex-shrink-0">
                          {item.products?.cover_image_url ? (
                            <img src={item.products.cover_image_url} alt="Produit" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-montserrat font-bold uppercase text-gray-400">EDEN store</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-black line-clamp-2">
                            {item.products?.title || 'PRODUIT SUPPRIMÉ'}
                          </p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                            QTÉ: <span className="text-black text-xs">{item.quantity}</span>
                          </p>
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