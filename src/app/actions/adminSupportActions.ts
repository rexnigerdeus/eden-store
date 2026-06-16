'use server'

import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Garde-fou : toute action admin commence par vérifier que l'appelant est bien
// un administrateur (sinon on court-circuite silencieusement).
// ============================================================================
async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Action réservée aux administrateurs.')
  }
  return user
}

// ============================================================================
// Liste de tous les tickets (avec infos user)
// ============================================================================
export type AdminTicketRow = {
  id: string
  user_id: string
  user_full_name: string | null
  user_email: string | null
  subject: string
  category: string
  status: string
  priority: string
  assigned_admin: string | null
  last_user_reply_at: string | null
  last_admin_reply_at: string | null
  order_id: string | null
  created_at: string
  updated_at: string
  unread_for_admin: boolean
}

export async function listAllTickets(filters?: {
  status?: string
  search?: string
}): Promise<{ tickets: AdminTicketRow[]; counts: Record<string, number> }> {
  await ensureAdmin()

  let query = supabaseAdmin
    .from('support_tickets')
    .select('id, user_id, subject, category, status, priority, assigned_admin, last_user_reply_at, last_admin_reply_at, order_id, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data: tickets, error } = await query
  if (error) {
    console.error('[admin-support] listAllTickets', error)
    return { tickets: [], counts: {} }
  }

  // Récupérer en lot les profils + auth.users
  const userIds = Array.from(new Set((tickets || []).map((t: any) => t.user_id)))
  const profilesMap: Record<string, string> = {}
  const emailMap: Record<string, string> = {}

  if (userIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)
    ;(profiles || []).forEach((p: any) => {
      profilesMap[p.id] = p.full_name
    })

    // Emails via Auth Admin
    await Promise.all(
      userIds.map(async (uid) => {
        const { data } = await supabaseAdmin.auth.admin.getUserById(uid)
        if (data?.user?.email) emailMap[uid] = data.user.email
      })
    )
  }

  // Compte par statut
  const counts: Record<string, number> = { open: 0, pending: 0, resolved: 0, closed: 0 }
  const enriched: AdminTicketRow[] = (tickets || []).map((t: any) => {
    counts[t.status] = (counts[t.status] || 0) + 1
    return {
      ...t,
      user_full_name: profilesMap[t.user_id] || null,
      user_email: emailMap[t.user_id] || null,
      unread_for_admin: !t.last_user_reply_at
        ? false
        : !t.last_admin_reply_at
        ? true
        : new Date(t.last_user_reply_at).getTime() > new Date(t.last_admin_reply_at).getTime(),
    }
  })

  // Filtre "search" côté client (déjà chargé)
  let filtered = enriched
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    filtered = enriched.filter((t) =>
      [t.subject, t.user_full_name, t.user_email, t.category].some((v) => (v || '').toLowerCase().includes(q))
    )
  }

  return { tickets: filtered, counts: counts }
}

// ============================================================================
// Détail complet d'un ticket (admin)
// ============================================================================
export async function getAdminTicketDetail(ticketId: string) {
  await ensureAdmin()

  const { data: ticket } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (!ticket) return { ticket: null, messages: [], user: null, order: null }

  const { data: messages } = await supabaseAdmin
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  let userFullName: string | null = null
  let userEmail: string | null = null
  const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', ticket.user_id).single()
  userFullName = profile?.full_name || null
  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(ticket.user_id)
  userEmail = authData?.user?.email || null

  // Si le ticket référence une commande, on l'enrichit pour l'affichage
  let order: { id: string; status: string; total_amount: number; created_at: string; shop_name: string | null; customer_name: string | null } | null = null
  if (ticket.order_id) {
    const { data: orderData } = await supabaseAdmin
      .from('orders')
      .select('id, status, total_amount, created_at, customer_name, shops(name)')
      .eq('id', ticket.order_id)
      .maybeSingle()
    if (orderData) {
      order = {
        id: orderData.id,
        status: orderData.status,
        total_amount: Number(orderData.total_amount),
        created_at: orderData.created_at,
        customer_name: orderData.customer_name,
        shop_name: (orderData as any).shops?.name || null,
      }
    }
  }

  return {
    ticket,
    messages: messages || [],
    user: { id: ticket.user_id, full_name: userFullName, email: userEmail },
    order,
  }
}

// ============================================================================
// Réponse admin dans un ticket
// ============================================================================
export async function adminSendMessage(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const adminUser = await ensureAdmin()

  const ticketId = (formData.get('ticket_id') as string | null) || ''
  const content = (formData.get('content') as string | null)?.trim() || ''
  const attachmentPath = (formData.get('attachment_path') as string | null) || null
  const attachmentName = (formData.get('attachment_name') as string | null) || null
  const attachmentSize = parseInt((formData.get('attachment_size') as string | null) || '0', 10)
  const attachmentMime = (formData.get('attachment_mime') as string | null) || null

  if (!ticketId) return { ok: false, error: 'Ticket manquant.' }
  if (!content && !attachmentPath) return { ok: false, error: 'Message vide.' }

  const { error } = await supabaseAdmin.from('support_messages').insert({
    ticket_id: ticketId,
    sender_id: adminUser.id,
    sender_role: 'admin',
    content: content || null,
    attachment_path: attachmentPath,
    attachment_name: attachmentName,
    attachment_size: attachmentSize || null,
    attachment_mime: attachmentMime,
  })

  if (error) {
    console.error('[admin-support] send', error)
    return { ok: false, error: "Impossible d'envoyer le message." }
  }

  await supabaseAdmin
    .from('support_tickets')
    .update({
      status: 'pending',
      last_admin_reply_at: new Date().toISOString(),
      assigned_admin: adminUser.id,
    })
    .eq('id', ticketId)

  revalidatePath('/admin/support')
  revalidatePath(`/admin/support/${ticketId}`)
  return { ok: true }
}

// ============================================================================
// Mise à jour statut / priorité / assignation
// ============================================================================
export async function updateTicketStatus(ticketId: string, status: string): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin()
  const allowed = ['open', 'pending', 'resolved', 'closed']
  if (!allowed.includes(status)) return { ok: false, error: 'Statut invalide.' }

  const { error } = await supabaseAdmin.from('support_tickets').update({ status }).eq('id', ticketId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/support')
  revalidatePath(`/admin/support/${ticketId}`)
  return { ok: true }
}

export async function updateTicketPriority(ticketId: string, priority: string): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin()
  const allowed = ['low', 'normal', 'high', 'urgent']
  if (!allowed.includes(priority)) return { ok: false, error: 'Priorité invalide.' }

  const { error } = await supabaseAdmin.from('support_tickets').update({ priority }).eq('id', ticketId)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/support/${ticketId}`)
  return { ok: true }
}

export async function assignTicketToMe(ticketId: string): Promise<{ ok: boolean; error?: string }> {
  const adminUser = await ensureAdmin()
  const { error } = await supabaseAdmin
    .from('support_tickets')
    .update({ assigned_admin: adminUser.id })
    .eq('id', ticketId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/support')
  revalidatePath(`/admin/support/${ticketId}`)
  return { ok: true }
}

// ============================================================================
// Toggle du rappel vendeur (platform_settings.seller_reminder_enabled)
// ============================================================================
export async function toggleSellerReminder(): Promise<{ ok: boolean; enabled: boolean; error?: string }> {
  await ensureAdmin()

  const { data: row } = await supabaseAdmin
    .from('platform_settings')
    .select('setting_value')
    .eq('setting_key', 'seller_reminder_enabled')
    .maybeSingle()

  const current = Number(row?.setting_value ?? 1)
  const next = current === 1 ? 0 : 1

  const { error } = await supabaseAdmin
    .from('platform_settings')
    .upsert(
      { setting_key: 'seller_reminder_enabled', setting_value: next, updated_at: new Date().toISOString() },
      { onConflict: 'setting_key' }
    )

  if (error) return { ok: false, enabled: current === 1, error: error.message }
  revalidatePath('/admin/users')
  return { ok: true, enabled: next === 1 }
}

export async function getSellerReminderState(): Promise<{ enabled: boolean }> {
  try {
    await ensureAdmin()
  } catch {
    return { enabled: true }
  }
  const { data } = await supabaseAdmin
    .from('platform_settings')
    .select('setting_value')
    .eq('setting_key', 'seller_reminder_enabled')
    .maybeSingle()
  return { enabled: Number(data?.setting_value ?? 1) === 1 }
}
