import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ClientInboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  
  // Vérifier si le client est aussi un vendeur pour le menu latéral
  const { data: userShop } = await supabase.from('shops').select('id, name').eq('seller_id', user.id).maybeSingle()

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

  const formattedConversations = conversations?.map((conv: any) => {
    const sortedMessages = conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const lastMessage = sortedMessages[0]
    const unreadCount = conv.messages.filter((m: any) => !m.is_read && m.sender_id !== user.id).length

    return { ...conv, lastMessage, unreadCount }
  }) || []

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 py-8 md:py-16">
        
        {/* EN-TÊTE */}
        <div className="mb-10 md:mb-16 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">Mes Messages</h1>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-bold mt-3">
            Bonjour {profile?.full_name}, vos échanges avec nos marques.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* MENU LATÉRAL STRICT */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-50 border-2 border-black sticky top-24 p-4 space-y-2">
              {userShop && (
                <div className="mb-6">
                  <Link href="/seller/dashboard" className="block w-full text-center px-4 py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors border border-black">
                    ⚙️ Espace Vendeur
                  </Link>
                </div>
              )}
              <nav className="flex flex-col space-y-1">
                <Link href="/account" className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
                  Mes commandes
                </Link>
                <Link href="/account/messages" className="px-4 py-3 text-xs font-bold uppercase tracking-widest bg-black text-white transition-colors">
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

          {/* LISTE DES MESSAGES */}
          <div className="flex-1">
            <div className="bg-white border-2 border-black overflow-hidden">
              {formattedConversations.length === 0 ? (
                <div className="p-12 md:p-20 text-center bg-gray-50">
                  <h3 className="text-xl md:text-2xl font-montserrat font-black text-black uppercase tracking-widest mb-2">Aucun Message</h3>
                  <p className="text-xs uppercase tracking-widest text-gray-500">Vous n'avez aucune conversation en cours.</p>
                </div>
              ) : (
                <div className="divide-y-2 divide-black">
                  {formattedConversations.map((conv: any) => (
                    <Link 
                      key={conv.id} 
                      href={`/account/messages/${conv.shops?.id}`}
                      className="block p-4 sm:p-6 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 sm:space-x-6">
                        
                        {/* Logo Boutique (Carré) */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 border-2 border-black overflow-hidden flex items-center justify-center font-montserrat font-black text-xl flex-shrink-0">
                          {conv.shops?.logo_url ? (
                            <img src={conv.shops.logo_url} alt={conv.shops.name} className="w-full h-full object-cover grayscale-[20%]" />
                          ) : (
                            conv.shops?.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        
                        {/* Aperçu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-2">
                            <h3 className={`text-sm md:text-base uppercase tracking-widest truncate ${conv.unreadCount > 0 ? 'font-montserrat font-black text-black' : 'font-bold text-gray-600'}`}>
                              {conv.shops?.name}
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
                            
                            {/* Badge Brutaliste */}
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

        </div>
      </main>
    </div>
  )
}