import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ChatBox from './ChatBox'

export default async function ClientChatPage({
  params
}: {
  params: Promise<{ shopId: string }>
}) {
  const resolvedParams = await params
  const shopId = resolvedParams.shopId

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Récupérer les infos de la boutique
  const { data: shop } = await supabase.from('shops').select('id, name').eq('id', shopId).single()
  if (!shop) notFound()

  // 2. Vérifier si une conversation existe entre ce client et cette boutique
  let { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('customer_id', user.id)
    .eq('shop_id', shop.id)
    .single()

  // 3. Si aucune conversation n'existe, on la crée
  if (!conversation) {
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({ customer_id: user.id, shop_id: shop.id })
      .select('id')
      .single()
      
    if (error) throw new Error("Impossible de créer la conversation")
    conversation = newConv
  }

  // 4. Récupérer l'historique des messages de cette conversation
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true }) // Les plus anciens d'abord pour le scroll

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-6">
          <Link href="/account" className="text-gray-500 hover:text-walmart-blue font-medium flex items-center gap-2 w-fit">
            &larr; Retour à mes commandes
          </Link>
        </div>

        {/* On injecte notre composant Client Realtime ici */}
        <ChatBox 
          conversationId={conversation.id} 
          initialMessages={messages || []} 
          currentUserId={user.id} 
          shopName={shop.name}
        />

      </main>
    </div>
  )
}