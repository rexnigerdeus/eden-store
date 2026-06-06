import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SellerInboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Trouver la boutique du vendeur
  const { data: shop } = await supabase.from('shops').select('id').eq('seller_id', user.id).single()

  let conversations = []

  // 2. Récupérer toutes les conversations
  if (shop) {
    const { data } = await supabase
      .from('conversations')
      .select(`
        id,
        updated_at,
        profiles!customer_id (id, full_name),
        messages (content, created_at, sender_id, is_read)
      `)
      .eq('shop_id', shop.id)
      .order('updated_at', { ascending: false })
      
    if (data) {
      conversations = data.map((conv: any) => {
        const sortedMessages = conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        const unreadCount = conv.messages.filter((m: any) => !m.is_read && m.sender_id !== user.id).length

        return {
          ...conv,
          lastMessage: sortedMessages[0] || null,
          unreadCount
        }
      })
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      
      {/* EN-TÊTE */}
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
              <Link 
                key={conv.id} 
                href={`/seller/dashboard/messages/${conv.id}`}
                className="block p-4 sm:p-6 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4 sm:space-x-6">
                  
                  {/* Avatar Client Brutaliste */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black text-white flex items-center justify-center font-montserrat font-black text-xl flex-shrink-0 border-2 border-black">
                    {conv.profiles?.full_name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  
                  {/* Aperçu du message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className={`text-sm md:text-base uppercase tracking-widest truncate ${conv.unreadCount > 0 ? 'font-montserrat font-black text-black' : 'font-bold text-gray-600'}`}>
                        {conv.profiles?.full_name || 'Client Inconnu'}
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
                      
                      {/* Pastille de notification (Carrée et agressive) */}
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