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

  const { data: shop } = await supabase.from('shops').select('id, name').eq('id', shopId).single()
  if (!shop) notFound()

  let { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('customer_id', user.id)
    .eq('shop_id', shop.id)
    .single()

  if (!conversation) {
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({ customer_id: user.id, shop_id: shop.id })
      .select('id')
      .single()
      
    if (error) throw new Error("Impossible de créer la conversation")
    conversation = newConv
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        <div className="mb-6 border-b border-gray-200 pb-6">
          <Link href="/account/messages" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline">
            &larr; Retour à mes messages
          </Link>
        </div>

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