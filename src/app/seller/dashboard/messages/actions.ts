'use server'

import { createClient } from '@/utils/supabase/server'

export async function sendSellerMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Non connecté")
  if (!content.trim()) return

  const { data: newMessage, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id, // Ici, l'expéditeur est le vendeur
      content: content.trim()
    })
    .select()
    .single()

  if (error) {
    console.error("Erreur d'envoi du message :", error)
    return { error: "Impossible d'envoyer le message." }
  }
  
  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)

  return { success: true, message: newMessage }
}

// NOUVELLE FONCTION : Marquer comme lu
export async function markAsRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // On passe "is_read" à true pour les messages qu'on a REÇUS (ceux dont on n'est pas l'expéditeur)
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false)
}