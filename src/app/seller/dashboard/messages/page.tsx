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

  // 2. Récupérer toutes les conversations de cette boutique (en incluant is_read)
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
        // Trier les messages
        const sortedMessages = conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        
        // 🔥 Compter les messages non lus (reçus du client) 🔥
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
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boîte de réception</h1>
        <p className="text-gray-500 mt-1">Échangez avec vos clients et répondez à leurs questions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {conversations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="text-5xl mb-4 block">💬</span>
            <p>Aucun message pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv: any) => (
              <Link 
                key={conv.id} 
                href={`/seller/dashboard/messages/${conv.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar Client */}
                  <div className="w-12 h-12 bg-walmart-light text-walmart-blue rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {conv.profiles?.full_name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  
                  {/* Aperçu du message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {conv.profiles?.full_name || 'Client Inconnu'}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {conv.lastMessage ? new Date(conv.lastMessage.created_at).toLocaleDateString('fr-FR') : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate pr-4 ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage?.sender_id === user.id ? 'Vous: ' : ''}
                        {conv.lastMessage?.content || 'Nouvelle conversation'}
                      </p>
                      
                      {/* 🔥 LA PASTILLE ROUGE POUR LE VENDEUR 🔥 */}
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                          {conv.unreadCount}
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