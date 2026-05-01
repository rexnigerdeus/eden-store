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

  // Récupérer la conversation et s'assurer qu'elle appartient bien à une boutique de CE vendeur
  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      id,
      shop_id,
      shops!inner (seller_id),
      profiles!customer_id (full_name)
    `)
    .eq('id', conversationId)
    .eq('shops.seller_id', user.id) // Sécurité RLS
    .single()

  if (!conversation) notFound()

  // Récupérer l'historique des messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl space-y-4 sm:space-y-6">
      <div>
        <Link href="/seller/dashboard/messages" className="text-sm sm:text-base text-gray-500 hover:text-blue-600 font-medium flex items-center gap-1.5 sm:gap-2 w-fit mb-3 sm:mb-4">
          &larr; Retour aux messages
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