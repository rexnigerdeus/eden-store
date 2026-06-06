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

  // 3. VÉRIFICATION : L'utilisateur est-il aussi un vendeur ?
  const { data: shop } = await supabase
    .from('shops')
    .select('id, name')
    .eq('seller_id', user.id)
    .maybeSingle()

  // 4. Récupérer l'historique de SES commandes
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

  // Style brutaliste pour les statuts
  const statusConfig: Record<string, { label: string, color: string }> = {
    pending: { label: 'En attente', color: 'bg-white text-black border-black' },
    processing: { label: 'En préparation', color: 'bg-gray-200 text-black border-gray-400' },
    shipped: { label: 'Expédiée', color: 'bg-black text-white border-black' },
    delivered: { label: 'Livrée', color: 'bg-green-600 text-white border-green-600' },
    cancelled: { label: 'Annulée', color: 'bg-red-600 text-white border-red-600' },
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 py-8 md:py-16">
        
        {/* EN-TÊTE DU COMPTE */}
        <div className="mb-10 md:mb-16 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">Mon Compte</h1>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-bold mt-3">
            Bienvenue, {profile?.full_name || user?.user_metadata?.full_name || 'Client'}.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* MENU LATÉRAL */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-50 border-2 border-black sticky top-24 p-4 space-y-2">
              
              {shop && (
                <div className="mb-6">
                  <Link 
                    href="/seller/dashboard" 
                    className="block w-full text-center px-4 py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors border border-black"
                  >
                    ⚙️ Espace Vendeur
                  </Link>
                </div>
              )}

              <nav className="flex flex-col space-y-1">
                <Link href="/account" className="px-4 py-3 text-xs font-bold uppercase tracking-widest bg-black text-white transition-colors">
                  Mes commandes
                </Link>
                <Link href="/account/messages" className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
                  Mes messages
                </Link>
                <Link href="/account/favorites" className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
                  Mes favoris
                </Link>
                <Link href="/track" className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 transition-colors mt-2">
                  Suivi rapide
                </Link>
              </nav>
              
              <div className="border-t border-gray-300 my-4"></div>
              
              <form action="/auth/signout" method="POST">
                <button type="submit" className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors">
                  Déconnexion
                </button>
              </form>
            </div>
          </div>

          {/* CONTENU PRINCIPAL : HISTORIQUE */}
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-montserrat font-black text-black uppercase tracking-tight mb-8">Historique des achats</h2>

            {orders && orders.length > 0 ? (
              <div className="space-y-8">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border-2 border-black flex flex-col">
                    
                    {/* En-tête de la facture client */}
                    <div className="bg-gray-50 p-4 md:p-6 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-black uppercase tracking-widest">Date : {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-widest">Réf: {order.id}</p>
                      </div>
                      <div className="sm:text-right">
                        <span className={`inline-block px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 ${statusConfig[order.status]?.color || 'bg-white text-black border-black'}`}>
                          {statusConfig[order.status]?.label || order.status}
                        </span>
                      </div>
                    </div>

                    {/* Corps de la commande */}
                    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
                      
                      {/* Les articles */}
                      <div className="flex-1 space-y-4">
                        {order.order_items.map((item: any, index: number) => (
                          <div key={`item-${index}`} className="flex items-start space-x-4">
                            <div className="w-16 h-20 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                              {item.products?.cover_image_url ? (
                                <img src={item.products.cover_image_url} alt="Produit" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-montserrat font-bold text-gray-400 uppercase">ASIM</div>
                              )}
                            </div>
                            <div className="pt-1">
                              <p className="font-bold text-xs text-black uppercase tracking-widest line-clamp-2">{item.products?.title || 'Article indisponible'}</p>
                              <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">QTÉ: <span className="text-black">{item.quantity}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Résumé vendeur et Actions */}
                      <div className="md:w-64 flex-shrink-0 flex flex-col justify-between pt-6 md:pt-0 border-t md:border-t-0 md:border-l md:border-gray-200 md:pl-8">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vendeur</p>
                          <Link href={`/shop/${order.shops?.slug}`} className="text-sm font-black text-black uppercase tracking-widest hover:underline block mb-4">
                            {order.shops?.name}
                          </Link>
                          
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Payé</p>
                          <p className="text-xl font-montserrat font-black text-red-600">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(order.total_amount)}
                          </p>
                        </div>
                        
                        <div className="mt-6 flex flex-col gap-3">
                          <Link href={`/track?orderId=${order.id}&phone=${order.customer_phone}`} className="w-full py-4 text-center text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-gray-900 transition-colors border-2 border-black">
                            Suivre le colis
                          </Link>
                          <Link href={`/account/messages/${order.shops?.id}`} className="w-full py-4 text-center text-[10px] font-black uppercase tracking-widest bg-white text-black border-2 border-black hover:bg-gray-50 transition-colors">
                            Contacter vendeur
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 border-2 border-black">
                <h3 className="text-xl md:text-2xl font-montserrat font-black text-black uppercase tracking-widest mb-4">Aucune commande</h3>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">Votre historique d'achats est vide.</p>
                <Link href="/" className="inline-block px-10 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors border-2 border-black">
                  Découvrir le catalogue
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}