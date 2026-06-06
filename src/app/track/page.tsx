import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const isValidUUID = (uuid: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; phone?: string }>
}) {
  const resolvedParams = await searchParams
  const orderId = resolvedParams.orderId?.trim()
  const phone = resolvedParams.phone?.trim()

  const { supabaseAdmin } = await import('@/utils/supabase/admin')
  const supabase = supabaseAdmin 
  
  let order = null
  let errorMessage = ''

  if (orderId && phone) {
    if (!isValidUUID(orderId)) {
      errorMessage = "Le format du numéro de commande est incorrect."
    } else {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shops (id, name, whatsapp),
          order_items (
            quantity,
            price_at_time,
            products (title, cover_image_url)
          )
        `)
        .eq('id', orderId)
        .eq('customer_phone', phone)
        .single()

      if (error || !data) {
        errorMessage = "Aucune commande trouvée avec ces informations."
      } else {
        order = data
      }
    }
  }

  // Statuts Brutalistes
  const statusConfig: Record<string, { label: string, color: string }> = {
    pending: { label: 'En attente', color: 'bg-white text-black border-black' },
    processing: { label: 'En préparation', color: 'bg-gray-200 text-black border-gray-400' },
    shipped: { label: 'Expédiée', color: 'bg-black text-white border-black' },
    delivered: { label: 'Livrée', color: 'bg-green-600 text-white border-green-600' },
    cancelled: { label: 'Annulée', color: 'bg-red-600 text-white border-red-600' },
  }

  const inputClasses = "w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors rounded-none uppercase tracking-widest"

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="max-w-[1000px] mx-auto px-4 py-12 md:py-20 space-y-12">
        
        <div className="text-center border-b border-gray-200 pb-8">
          <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">Suivi de Colis</h1>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-bold mt-4">Localisez votre expédition instantanément.</p>
        </div>

        {/* FORMULAIRE DE RECHERCHE */}
        <div className="bg-gray-50 border-2 border-black p-6 md:p-10">
          <form method="GET" action="/track" className="space-y-8">
            
            {errorMessage && (
              <div className="p-4 border-2 border-red-600 bg-red-50 text-xs font-bold uppercase tracking-widest text-red-600">
                ⚠️ {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="orderId" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Numéro de commande *</label>
                <input 
                  id="orderId" name="orderId" type="text" required defaultValue={orderId}
                  placeholder="Ex: 123e4567..." 
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Téléphone d'achat *</label>
                <input 
                  id="phone" name="phone" type="tel" required defaultValue={phone}
                  placeholder="Ex: 0102030405" 
                  className={inputClasses}
                />
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-black text-white font-montserrat font-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors border-2 border-black">
              Rechercher
            </button>
          </form>
        </div>

        {/* AFFICHAGE DES RÉSULTATS (Facture Brutaliste) */}
        {order && (
          <div className="bg-white border-2 border-black flex flex-col">
            
            {/* Bandeau d'en-tête de la facture */}
            <div className="bg-black p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">Émis le {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                <p className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">ID: {order.id}</p>
              </div>
              
              <div className={`px-4 py-2 border-2 text-xs font-black uppercase tracking-widest ${statusConfig[order.status]?.color || 'bg-white text-black border-black'}`}>
                {statusConfig[order.status]?.label || order.status}
              </div>
            </div>

            <div className="p-6 md:p-10 space-y-10">
              
              {/* Infos Livraison & Boutique */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-4">Destinataire</h3>
                  <div className="text-sm font-bold text-black uppercase tracking-wider space-y-1">
                    <p className="text-base font-black font-montserrat mb-2">{order.customer_name}</p>
                    <p className="text-gray-600 text-xs">TEL: <span className="text-black">{order.customer_phone}</span></p>
                    <p className="text-gray-600 text-xs">ADR: <span className="text-black">{order.customer_address}</span></p>
                    <p className="text-gray-600 text-xs">VIL: <span className="text-black">{order.customer_city}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-4">Expéditeur</h3>
                  <div className="text-sm font-bold text-black uppercase tracking-wider space-y-1">
                    <p className="text-base font-black font-montserrat mb-2">{order.shops?.name}</p>
                    <p className="text-gray-600 text-xs">PAIEMENT: <span className="text-black">À LA LIVRAISON</span></p>
                    <Link 
                      href={`/account/messages/${order.shops?.id}`} 
                      className="inline-block mt-4 w-full py-3 text-center text-[10px] font-black border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
                    >
                      Contacter le vendeur
                    </Link>
                  </div>
                </div>
              </div>

              {/* Articles */}
              <div>
                <h3 className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Contenu du colis</h3>
                <div className="space-y-6">
                  {order.order_items.map((item: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-start gap-6">
                      <div className="w-16 h-20 bg-gray-100 border-2 border-black overflow-hidden flex-shrink-0">
                        {item.products?.cover_image_url ? (
                          <img src={item.products.cover_image_url} alt="Produit" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-montserrat font-black text-gray-400 uppercase">ASIM</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="font-bold text-sm text-black uppercase tracking-widest line-clamp-2">{item.products?.title || 'PRODUIT NON DISPONIBLE'}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">QTÉ: <span className="text-black">{item.quantity}</span></p>
                      </div>
                      <div className="font-montserrat font-black text-base text-black pt-1">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.price_at_time)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Brut */}
              <div className="pt-8 border-t-2 border-black flex justify-between items-center">
                <span className="text-lg font-montserrat font-black text-black uppercase tracking-widest">Total Facturé</span>
                <span className="text-2xl md:text-3xl font-montserrat font-black text-red-600">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(order.total_amount)}
                </span>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}