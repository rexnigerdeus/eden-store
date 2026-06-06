import { supabaseAdmin } from '@/utils/supabase/admin'
import ShopControls from './ShopControls'

// Empêche Next.js de mettre cette page en cache
export const dynamic = 'force-dynamic'

export default async function AdminShopsPage() {
  
  const { data: shops, error } = await supabaseAdmin
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erreur de récupération des boutiques:", error)
  }

  const pendingShops = shops?.filter(s => s.subscription_status === 'pending_verification').length || 0

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">Registre Vendeurs</h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">Gérez les accès, les abonnements et le statut partenaire.</p>
        </div>
        
        {/* Alerte Paiement Brutaliste */}
        {pendingShops > 0 && (
          <div className="bg-red-600 text-white px-6 py-4 border-2 border-black font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-lg">
            <span className="animate-pulse">⚠️</span> {pendingShops} PAIEMENT(S) EN ATTENTE
          </div>
        )}
      </div>

      {/* TABLEAU / REGISTRE */}
      <div className="bg-white border-2 border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            <thead>
              <tr className="bg-black text-white text-[10px] uppercase tracking-widest font-bold">
                <th className="p-4 sm:p-6 border-b-2 border-black">Boutique</th>
                <th className="p-4 sm:p-6 border-b-2 border-black">Contact</th>
                <th className="p-4 sm:p-6 border-b-2 border-black">Création</th>
                <th className="p-4 sm:p-6 border-b-2 border-black text-right">Contrôles (Niveau & Statut)</th>
              </tr>
            </thead>
            
            <tbody className="divide-y-2 divide-black">
              {shops && shops.length > 0 ? (
                shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Infos Boutique */}
                    <td className="p-4 sm:p-6">
                      <div className="flex items-center space-x-4">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt="Logo" className="w-12 h-12 object-cover border-2 border-black grayscale-[20%]" />
                        ) : (
                          <div className="w-12 h-12 border-2 border-black bg-gray-100 text-black flex items-center justify-center font-montserrat font-black uppercase text-xl shrink-0">
                            {shop.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-montserrat font-black text-sm text-black uppercase tracking-wider">{shop.name}</p>
                          <a href={`/shop/${shop.slug}`} target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:underline mt-1 inline-block">
                            Voir vitrine ↗
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 sm:p-6">
                      {shop.whatsapp ? (
                        <a href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="text-xs font-bold uppercase tracking-widest text-black hover:underline">
                          {shop.whatsapp}
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">N/A</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-4 sm:p-6">
                      <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                        {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </td>

                    {/* Contrôles Admin */}
                    <td className="p-4 sm:p-6 flex justify-end">
                      <ShopControls shop={shop} />
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-50">
                    Le registre est vide.
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