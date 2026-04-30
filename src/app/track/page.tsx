import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

// Petite fonction pour vérifier que l'ID a bien le format d'un UUID Supabase valide
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

  // On importe notre client Admin directement ici
  const { supabaseAdmin } = await import('@/utils/supabase/admin')
  const supabase = supabaseAdmin // On utilise le mode admin pour cette requête précise
  
  let order = null
  let errorMessage = ''

  // Si l'utilisateur a soumis le formulaire
  if (orderId && phone) {
    if (!isValidUUID(orderId)) {
      errorMessage = "Le format du numéro de commande est incorrect."
    } else {
      // On cherche la commande et on inclut la boutique ET les articles !
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
        errorMessage = "Aucune commande trouvée avec ces informations. Veuillez vérifier les données saisies."
      } else {
        order = data
      }
    }
  }

  // Traduction et couleurs des statuts
  const statusConfig: Record<string, { label: string, color: string, icon: string }> = {
    pending: { label: 'En attente', color: 'bg-orange-100 text-orange-800', icon: '⏳' },
    processing: { label: 'En préparation', color: 'bg-blue-100 text-blue-800', icon: '📦' },
    shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: '✅' },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: '❌' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-walmart-darkBlue">Suivre ma commande</h1>
          <p className="text-gray-500 mt-2">Entrez vos informations pour connaître l'état de votre livraison.</p>
        </div>

        {/* Le formulaire (Méthode GET pour utiliser l'URL) */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form method="GET" action="/track" className="space-y-6">
            
            {errorMessage && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">Numéro de commande</label>
                <input 
                  id="orderId" name="orderId" type="text" required defaultValue={orderId}
                  placeholder="Ex: 123e4567-e89b..." 
                  className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone utilisé</label>
                <input 
                  id="phone" name="phone" type="tel" required defaultValue={phone}
                  placeholder="Ex: 0102030405" 
                  className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-walmart-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm">
              Rechercher ma commande
            </button>
          </form>
        </div>

        {/* Affichage des résultats de la commande */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            
            {/* En-tête de la commande */}
            <div className="p-6 bg-walmart-light border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Commande du {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                <p className="font-mono text-xs text-gray-400 mt-1">{order.id}</p>
              </div>
              
              {/* Badge de statut */}
              <div className={`px-4 py-2 rounded-full font-medium flex items-center space-x-2 w-fit ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                <span>{statusConfig[order.status]?.icon}</span>
                <span>{statusConfig[order.status]?.label || order.status}</span>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              
              {/* Infos livraison & Boutique */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Adresse de livraison</h3>
                  <div className="text-gray-900 space-y-1">
                    <p className="font-medium">{order.customer_name}</p>
                    <p>{order.customer_phone}</p>
                    <p>{order.customer_address}</p>
                    <p>{order.customer_city}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Boutique partenaire</h3>
                  <div className="text-gray-900 space-y-1">
                    <p className="font-medium">{order.shops?.name}</p>
                    <p className="text-sm text-gray-500">Paiement : À la livraison</p>
                    <Link 
                          href={`/account/messages/${order.shops?.id}`} 
                          className="block w-full py-2 text-center text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          💬 Contacter le vendeur
                        </Link>
                  </div>
                </div>
              </div>

              {/* Liste des articles */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Article(s) commandé(s)</h3>
                <div className="space-y-4">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.products?.cover_image_url ? (
                          <img src={item.products.cover_image_url} alt="Produit" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.products?.title || 'Produit indisponible'}</p>
                        <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
                      </div>
                      <div className="font-semibold text-walmart-darkBlue">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.price_at_time)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total à payer</span>
                <span className="text-2xl font-bold text-walmart-blue">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(order.total_amount)}
                </span>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}