import { supabaseAdmin } from '@/utils/supabase/admin'
import ShopControls from './ShopControls'

// Empêche Next.js de mettre cette page en cache (on veut toujours les données en direct)
export const dynamic = 'force-dynamic'

export default async function AdminShopsPage() {
  
  // On récupère toutes les boutiques, triées par les plus récentes
  const { data: shops, error } = await supabaseAdmin
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erreur de récupération des boutiques:", error)
  }

  const pendingShops = shops?.filter(s => s.subscription_status === 'pending_verification').length || 0

  return (
    <div className="max-w-6xl space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Boutiques & Vendeurs</h1>
          <p className="text-gray-500 mt-2">Gérez les accès, les abonnements et le statut partenaire de vos vendeurs.</p>
        </div>
        
        {pendingShops > 0 && (
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center space-x-2">
            <span>⏳</span>
            <span>{pendingShops} paiement(s) en attente de vérification</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Boutique</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Date d'inscription</th>
                <th className="p-4 font-semibold">Administration (Niveau & Statut)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {shops && shops.length > 0 ? (
                shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Infos Boutique */}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-walmart-light text-walmart-blue flex items-center justify-center font-bold">
                            {shop.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{shop.name}</p>
                          <a href={`/shop/${shop.slug}`} target="_blank" className="text-xs text-walmart-blue hover:underline">
                            /shop/{shop.slug} ↗
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4">
                      {shop.whatsapp ? (
                        <a href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="text-sm font-medium text-[#25D366] hover:underline">
                          {shop.whatsapp}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Non renseigné</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                    </td>

                    {/* Contrôles Admin */}
                    <td className="p-4">
                      <ShopControls shop={shop} />
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Aucune boutique inscrite pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  )
}