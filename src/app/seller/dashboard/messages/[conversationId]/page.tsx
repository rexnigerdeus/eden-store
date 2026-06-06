import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
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

  const { data: conversation } = await supabaseAdmin
    .from('conversations')
    .select('id, shop_id, customer_id')
    .eq('id', conversationId)
    .single()

  if (!conversation) notFound()

  const { data: shopCheck } = await supabase
    .from('shops')
    .select('id')
    .eq('id', conversation.shop_id)
    .eq('seller_id', user.id)
    .single()

  if (!shopCheck) redirect('/seller/dashboard/messages')

  // --- RECHERCHE MULTI-COUCHES DU NOM DU CLIENT ---
  let clientName = ''

  // Couche 1 : Profil
  const { data: clientProfile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', conversation.customer_id).single()
  if (clientProfile?.full_name) clientName = clientProfile.full_name

  // Couche 2 : Métadonnées Auth
  if (!clientName) {
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(conversation.customer_id)
    if (authData?.user?.user_metadata?.full_name) clientName = authData.user.user_metadata.full_name
  }

  // Couche 3 : Historique des commandes
  if (!clientName) {
    const { data: orderData } = await supabaseAdmin.from('orders')
      .select('customer_name')
      .eq('customer_id', conversation.customer_id)
      .eq('shop_id', conversation.shop_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (orderData?.customer_name) clientName = orderData.customer_name
  }

  // Fallback ultime unique
  if (!clientName) clientName = `Client #${conversation.customer_id.substring(0, 4).toUpperCase()}`

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
        customerName={clientName}
      />
    </div>
  )
}