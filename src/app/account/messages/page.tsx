import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ClientInboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Récupérer le profil pour dire bonjour
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  // 2. Récupérer toutes les conversations de CE client
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      updated_at,
      shops (id, name, logo_url),
      messages (content, created_at, sender_id, is_read)
    `)
    .eq('customer_id', user.id)
    .order('updated_at', { ascending: false })

  // 3. Formater les données pour trouver le dernier message et compter les non-lus
  const formattedConversations = conversations?.map((conv: any) => {
    // Trier les messages du plus récent au plus ancien
    const sortedMessages = conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const lastMessage = sortedMessages[0]
    
    // Un message est "non lu" si is_read est false ET que l'expéditeur N'EST PAS le client lui-même
    const unreadCount = conv.messages.filter((m: any) => !m.is_read && m.sender_id !== user.id).length

    return {
      ...conv,
      lastMessage,
      unreadCount
    }
  }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-walmart-darkBlue">Mes Messages</h1>
          <p className="text-gray-500 mt-2">Bonjour {profile?.full_name}, retrouvez ici vos échanges avec les vendeurs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Menu latéral Client */}
          <div className="md:col-span-1 space-y-2">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
              <Link href="/account" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                Mes commandes
              </Link>
              <Link href="/account/messages" className="block px-4 py-2 bg-blue-50 text-walmart-blue font-medium rounded-lg">
                Mes messages
              </Link>
              <Link href="/account/favorites" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                Mes favoris
              </Link>
              <Link href="/track" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                Suivi rapide (Invité)
              </Link>
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {formattedConversations.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <span className="text-5xl mb-4 block">💬</span>
                  <p>Vous n'avez aucune conversation en cours.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {formattedConversations.map((conv: any) => (
                    <Link 
                      key={conv.id} 
                      href={`/account/messages/${conv.shops?.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Logo Boutique */}
                        <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center font-bold text-gray-400 flex-shrink-0">
                          {conv.shops?.logo_url ? (
                            <img src={conv.shops.logo_url} alt={conv.shops.name} className="w-full h-full object-cover" />
                          ) : (
                            conv.shops?.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        
                        {/* Aperçu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {conv.shops?.name}
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
                            
                            {/* 🔥 LA PASTILLE ROUGE (BADGE) 🔥 */}
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

        </div>
      </main>
    </div>
  )
}