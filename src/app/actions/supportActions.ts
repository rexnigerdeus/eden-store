'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Types partagés (utilisés par la bulle flottante et la page admin)
// ============================================================================
export type SupportTicket = {
  id: string
  user_id: string
  subject: string
  category: string
  status: 'open' | 'pending' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assigned_admin: string | null
  last_user_reply_at: string | null
  last_admin_reply_at: string | null
  order_id: string | null
  created_at: string
  updated_at: string
}

export type SupportMessage = {
  id: string
  ticket_id: string
  sender_id: string
  sender_role: 'user' | 'admin'
  content: string | null
  attachment_path: string | null
  attachment_name: string | null
  attachment_size: number | null
  attachment_mime: string | null
  created_at: string
}

// ============================================================================
// Lecture : tickets de l'utilisateur courant + leurs messages
// ============================================================================
export async function getMyTickets(): Promise<{ tickets: SupportTicket[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tickets: [] }

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[support] getMyTickets', error)
    return { tickets: [] }
  }
  return { tickets: (data || []) as SupportTicket[] }
}

export async function getTicketMessages(ticketId: string): Promise<{ messages: SupportMessage[]; ticket: SupportTicket | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { messages: [], ticket: null }

  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!ticket) return { messages: [], ticket: null }

  const { data: messages } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  return { messages: (messages || []) as SupportMessage[], ticket: ticket as SupportTicket }
}

// ============================================================================
// Création de ticket (multi-tickets : on en crée un à chaque demande)
// ============================================================================
export async function createTicket(formData: FormData): Promise<{ ok: boolean; ticketId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Non connecté' }

  const subject = (formData.get('subject') as string | null)?.trim() || ''
  const category = (formData.get('category') as string | null) || 'question'
  const priority = (formData.get('priority') as string | null) || 'normal'
  const firstMessage = (formData.get('message') as string | null)?.trim() || ''
  const attachmentPath = (formData.get('attachment_path') as string | null) || null
  const attachmentName = (formData.get('attachment_name') as string | null) || null
  const attachmentSize = parseInt((formData.get('attachment_size') as string | null) || '0', 10)
  const attachmentMime = (formData.get('attachment_mime') as string | null) || null
  const orderIdRaw = (formData.get('order_id') as string | null) || ''
  const orderId = orderIdRaw && orderIdRaw !== 'none' ? orderIdRaw : null

  if (!subject) return { ok: false, error: 'Le sujet est obligatoire.' }

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      subject,
      category,
      priority,
      status: 'open',
      order_id: orderId,
      last_user_reply_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !ticket) {
    console.error('[support] createTicket', error)
    return { ok: false, error: 'Impossible de créer le ticket.' }
  }

  // Premier message du ticket (obligatoire : sinon le support voit un ticket vide)
  if (firstMessage || attachmentPath) {
    const { error: msgErr } = await supabase.from('support_messages').insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_role: 'user',
      content: firstMessage || null,
      attachment_path: attachmentPath,
      attachment_name: attachmentName,
      attachment_size: attachmentSize || null,
      attachment_mime: attachmentMime,
    })
    if (msgErr) console.error('[support] first message insert', msgErr)
  }

  revalidatePath('/admin/support')
  return { ok: true, ticketId: ticket.id }
}

// ============================================================================
// Envoi d'un message dans un ticket existant (côté USER)
// ============================================================================
export async function sendSupportMessage(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Non connecté' }

  const ticketId = (formData.get('ticket_id') as string | null) || ''
  const content = (formData.get('content') as string | null)?.trim() || ''
  const attachmentPath = (formData.get('attachment_path') as string | null) || null
  const attachmentName = (formData.get('attachment_name') as string | null) || null
  const attachmentSize = parseInt((formData.get('attachment_size') as string | null) || '0', 10)
  const attachmentMime = (formData.get('attachment_mime') as string | null) || null

  if (!ticketId) return { ok: false, error: 'Ticket manquant.' }
  if (!content && !attachmentPath) return { ok: false, error: 'Message vide.' }

  // Vérifier que le ticket appartient bien à l'utilisateur
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('id, status')
    .eq('id', ticketId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!ticket) return { ok: false, error: 'Ticket introuvable.' }

  const { error } = await supabase.from('support_messages').insert({
    ticket_id: ticketId,
    sender_id: user.id,
    sender_role: 'user',
    content: content || null,
    attachment_path: attachmentPath,
    attachment_name: attachmentName,
    attachment_size: attachmentSize || null,
    attachment_mime: attachmentMime,
  })

  if (error) {
    console.error('[support] sendSupportMessage', error)
    return { ok: false, error: "Impossible d'envoyer le message." }
  }

  // Si l'user répond après une réponse admin, on repasse en "pending"
  await supabase
    .from('support_tickets')
    .update({
      status: ticket.status === 'resolved' || ticket.status === 'closed' ? 'open' : 'pending',
      last_user_reply_at: new Date().toISOString(),
    })
    .eq('id', ticketId)

  revalidatePath('/admin/support')
  return { ok: true }
}

// ============================================================================
// Fermeture d'un ticket par l'utilisateur
// ============================================================================
export async function closeTicket(ticketId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Non connecté' }

  const { error } = await supabase
    .from('support_tickets')
    .update({ status: 'closed' })
    .eq('id', ticketId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[support] closeTicket', error)
    return { ok: false, error: 'Impossible de fermer le ticket.' }
  }
  revalidatePath('/admin/support')
  return { ok: true }
}

// ============================================================================
// Upload d'une pièce jointe dans le bucket privé support-attachments
// Retourne le "path" relatif à stocker dans support_messages.attachment_path
// ============================================================================
export async function uploadSupportAttachment(formData: FormData): Promise<{ ok: boolean; path?: string; name?: string; size?: number; mime?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Non connecté' }

  const file = formData.get('file') as File | null
  const ticketId = (formData.get('ticket_id') as string | null) || 'pending'

  if (!file || file.size === 0) return { ok: false, error: 'Aucun fichier.' }
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: 'Fichier trop volumineux (max 10 MB).' }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80) || 'fichier'
  const path = `${ticketId}/${Date.now()}_${safeName}`

  const { error } = await supabase.storage
    .from('support-attachments')
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (error) {
    console.error('[support] upload', error)
    return { ok: false, error: error.message }
  }
  return { ok: true, path, name: safeName, size: file.size, mime: file.type || 'application/octet-stream' }
}

// ============================================================================
// Signed URL pour servir une pièce jointe (lecture temporaire, 1h)
// ============================================================================
export async function signAttachmentUrl(path: string): Promise<{ url: string | null; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { url: null, error: 'Non connecté' }

  // Le caller doit être participant au ticket (RLS bloque sinon).
  const { data, error } = await supabase.storage
    .from('support-attachments')
    .createSignedUrl(path, 60 * 60)

  if (error || !data) {
    console.error('[support] signedUrl', error)
    return { url: null, error: error?.message }
  }
  return { url: data.signedUrl }
}

// ============================================================================
// Récupération de la liste des catégories côté serveur (utile pour admin)
// ============================================================================
export async function getSupportCategoriesList(): Promise<Array<{ key: string; label: string; icon: string }>> {
  const { SUPPORT_CATEGORIES } = await import('@/utils/supportCategories')
  return SUPPORT_CATEGORIES.map((c) => ({ key: c.key, label: c.label, icon: c.icon }))
}

// ============================================================================
// Commandes récentes du user — pour qu'il puisse référencer une commande
// dans son ticket (en cours, payée, livrée...).
// ============================================================================
export type UserOrderRef = {
  id: string
  status: string
  total_amount: number
  created_at: string
  customer_name: string | null
  shop_name: string | null
  items_count: number
}

export async function getMyRecentOrders(): Promise<{ orders: UserOrderRef[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { orders: [] }

  // On lit uniquement les commandes du user (RLS 'Les clients voient leurs propres commandes')
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status, total_amount, created_at, customer_name, shops(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[support] getMyRecentOrders', error)
    return { orders: [] }
  }

  // Compte d'articles par commande (pour affichage dans le <select>)
  const ids = (orders || []).map((o: any) => o.id)
  const counts: Record<string, number> = {}
  if (ids.length > 0) {
    const { data: items } = await supabase
      .from('order_items')
      .select('order_id')
      .in('order_id', ids)
    ;(items || []).forEach((it: any) => {
      counts[it.order_id] = (counts[it.order_id] || 0) + 1
    })
  }

  return {
    orders: (orders || []).map((o: any) => ({
      id: o.id,
      status: o.status,
      total_amount: Number(o.total_amount),
      created_at: o.created_at,
      customer_name: o.customer_name,
      shop_name: o.shops?.name || null,
      items_count: counts[o.id] || 0,
    })),
  }
}

// ============================================================================
// Rappel vendeur : l'utilisateur enregistre qu'il a "vu plus tard" le rappel.
// Cela évite la réapparition pendant la session. À la prochaine connexion,
// le popup réapparaît sauf si la plateforme a désactivé le rappel ou si
// l'utilisateur a désormais une boutique.
// ============================================================================
export async function dismissSellerReminder(): Promise<{ ok: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  const { error } = await supabase
    .from('seller_reminder_dismissals')
    .upsert({ user_id: user.id, dismissed_at: new Date().toISOString() }, { onConflict: 'user_id' })

  if (error) {
    console.error('[support] dismissSellerReminder', error)
    return { ok: false }
  }
  return { ok: true }
}

// ============================================================================
// Lecture serveur : détermine si le popup "configurez votre boutique" doit
// s'afficher pour l'utilisateur courant. Renvoie les infos minimales pour
// décider côté client.
// ============================================================================
export async function getSellerReminderState(): Promise<{
  show: boolean
  reason: 'not-seller' | 'has-shop' | 'dismissed' | 'disabled' | 'ready'
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { show: false, reason: 'not-seller' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') return { show: false, reason: 'not-seller' }

  // Toggle global admin
  const { data: setting } = await supabase
    .from('platform_settings')
    .select('setting_value')
    .eq('setting_key', 'seller_reminder_enabled')
    .maybeSingle()
  if (Number(setting?.setting_value ?? 1) !== 1) return { show: false, reason: 'disabled' }

  // Boutique existante ?
  const { data: shop } = await supabase.from('shops').select('id').eq('seller_id', user.id).maybeSingle()
  if (shop) return { show: false, reason: 'has-shop' }

  // Dismissed recently ?
  const { data: dismiss } = await supabase
    .from('seller_reminder_dismissals')
    .select('dismissed_at')
    .eq('user_id', user.id)
    .maybeSingle()
  if (dismiss?.dismissed_at) {
    // On autorise la réapparition si le dernier dismiss date de plus de 6h
    const ageHours = (Date.now() - new Date(dismiss.dismissed_at).getTime()) / 36e5
    if (ageHours < 6) return { show: false, reason: 'dismissed' }
  }

  return { show: true, reason: 'ready' }
}
