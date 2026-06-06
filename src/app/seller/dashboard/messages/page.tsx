import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SellerInboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: shop } = await supabase.from('shops').select('id').eq('seller_id', user.id).single()

  let conversations: any[] = []

  if (shop) {
    const { data: convData } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        updated_at,
        customer_id,
        messages (content, created_at, sender_id, is_read)
      `)
      .eq('shop_id', shop.id)
      .order('updated_at', { ascending: false })
      
    if (convData && convData.length > 0) {
      const customerIds = [...new Set(convData.map(c => c.customer_id).filter(Boolean))]
      const profilesMap: Record<string, string> = {}

      // RECHERCHE MULTI-COUCHES DU NOM DU CLIENT
      for (const customerId of customerIds) {
        let finalName = ''

        // Couche 1 : Table Profiles
        const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', customerId).single()
        if (profile?.full_name) finalName = profile.full_name

        // Couche 2 : Métadonnées du compte (Auth)
        if (!finalName) {
          const { data: authData } = await supabaseAdmin.auth.admin.getUserById(customerId)
          const metaName = authData?.user?.user_metadata?.full_name
          if (metaName) finalName = metaName
        }

        // Couche 3 : Nom utilisé lors de sa dernière commande dans cette boutique !
        if (!finalName) {
          const { data: orderData } = await supabaseAdmin.from('orders')
            .select('customer_name')
            .eq('customer_id', customerId)
            .eq('shop_id', shop.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          
          if (orderData?.customer_name) finalName = orderData.customer_name
        }

        // Couche Finale : Si vraiment introuvable, on donne un identifiant unique (ex: Client #A1B2)
        profilesMap[customerId] = finalName || `Client #${customerId.substring(0, 4).toUpperCase()}`
      }

      conversations = convData.map((conv: any) => {
        const sortedMessages = conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        const unreadCount = conv.messages.filter((m: any) => !m.is_read && m.sender_id !== user.id).length
        const clientName = profilesMap[conv.customer_id]

        return {
          ...conv,
          clientName,
          lastMessage: sortedMessages[0] || null,
          unreadCount
        }
      })
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-montserrat font-black text-black uppercase tracking-tight">Boîte de réception</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Échangez avec vos clients et répondez à leurs questions.</p>
      </div>

      <div className="bg-white border-2 border-black overflow-hidden">
        {conversations.length === 0 ? (
          <div className="p-12 md:p-20 text-center bg-gray-50">
            <h3 className="text-xl md:text-2xl font-montserrat font-black text-black uppercase tracking-widest mb-2">Aucun Message</h3>
            <p className="text-xs uppercase tracking-widest text-gray-500">Votre messagerie est vide pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-black">
            {conversations.map((conv: any) => (
              <Link key={conv.id} href={`/seller/dashboard/messages/${conv.id}`} className="block p-4 sm:p-6 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black text-white flex items-center justify-center font-montserrat font-black text-xl flex-shrink-0 border-2 border-black">
                    {(conv.clientName.charAt(0) || 'C').toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className={`text-sm md:text-base uppercase tracking-widest truncate ${conv.unreadCount > 0 ? 'font-montserrat font-black text-black' : 'font-bold text-gray-600'}`}>
                        {conv.clientName}
                      </h3>
                      <span className="text-[10px] font-bold sm:text-xs text-gray-400 uppercase tracking-widest whitespace-nowrap ml-2">
                        {conv.lastMessage ? new Date(conv.lastMessage.created_at).toLocaleDateString('fr-FR') : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-xs sm:text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-black' : 'text-gray-500'}`}>
                        {conv.lastMessage?.sender_id === user.id ? 'Vous: ' : ''}
                        {conv.lastMessage?.content || 'Nouvelle conversation'}
                      </p>
                      
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 shrink-0 border border-red-600">
                          {conv.unreadCount} NOUVEAU{conv.unreadCount > 1 ? 'X' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}