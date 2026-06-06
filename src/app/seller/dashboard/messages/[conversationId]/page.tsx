import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import SellerChatBox from './SellerChatBox'

export default async function SellerChatPage({
  params
}: {
  params: Promise<{ conversationId: string }>
}) {
  const resolvedParams = await params
  const conversationId = resolvedParams.conversationId

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      id,
      shop_id,
      shops!inner (seller_id),
      profiles!customer_id (full_name)
    `)
    .eq('id', conversationId)
    .eq('shops.seller_id', user.id)
    .single()

  if (!conversation) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      
      <div className="border-b border-gray-200 pb-6 flex items-center">
        <Link href="/seller/dashboard/messages" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline">
          &larr; Retour à la boîte de réception
        </Link>
      </div>

      <SellerChatBox 
        conversationId={conversation.id} 
        initialMessages={messages || []} 
        currentUserId={user.id} 
        customerName={(conversation.profiles as any)?.full_name || (conversation.profiles as any)?.[0]?.full_name || 'Client'}
      />
    </div>
  )
}