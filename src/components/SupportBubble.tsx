'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  getMyTickets,
  getTicketMessages,
  createTicket,
  sendSupportMessage,
  closeTicket,
  uploadSupportAttachment,
  signAttachmentUrl,
  getMyRecentOrders,
  type SupportTicket,
  type SupportMessage,
  type UserOrderRef,
} from '@/app/actions/supportActions'
import { categoriesForRole, getCategoryMeta, type SupportCategoryKey } from '@/utils/supportCategories'

// ============================================================================
// Bulle flottante "Support Eden" — visible partout SAUF /admin et /seller/dashboard
// ============================================================================

type Mode = 'list' | 'new' | 'conversation'

export default function SupportBubble() {
  const pathname = usePathname() || ''
  const router = useRouter()

  // Routes où on masque la bulle (admin & dashboard vendeur)
  const isExcluded = useMemo(() => {
    if (pathname.startsWith('/admin')) return true
    if (pathname.startsWith('/seller/dashboard')) return true
    return false
  }, [pathname])

  const [open, setOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'admin' | null>(null)

  // Data
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [mode, setMode] = useState<Mode>('list')
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])

  // New ticket form
  const [newSubject, setNewSubject] = useState('')
  const [newCategory, setNewCategory] = useState<SupportCategoryKey>('question')
  const [newPriority, setNewPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [newBody, setNewBody] = useState('')
  const [newAttachment, setNewAttachment] = useState<{ path: string; name: string; size: number; mime: string } | null>(null)
  const [newOrderId, setNewOrderId] = useState<string>('none')
  const [myOrders, setMyOrders] = useState<UserOrderRef[]>([])

  // Reply form
  const [replyBody, setReplyBody] = useState('')
  const [replyAttachment, setReplyAttachment] = useState<{ path: string; name: string; size: number; mime: string } | null>(null)

  // UI state
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [hasUnreadFromAdmin, setHasUnreadFromAdmin] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const supabase = createClient()

  // -------------------------------------------------------------------------
  // Auth + role
  // -------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return
      if (!data.user) {
        setIsAuthed(false)
        return
      }
      setIsAuthed(true)
      setUserId(data.user.id)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      const role = (profile?.role as any) || 'buyer'
      setUserRole(role)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session?.user)
      setUserId(session?.user?.id || null)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  // -------------------------------------------------------------------------
  // Charger les tickets à l'ouverture
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!open || !isAuthed) return
    refreshTickets()
    refreshOrders()
  }, [open, isAuthed])

  async function refreshTickets() {
    const { tickets } = await getMyTickets()
    setTickets(tickets)
    // Détection non lus côté admin (réponse admin après la dernière réponse user)
    const lastAdmin = tickets
      .map((t) => t.last_admin_reply_at)
      .filter(Boolean)
      .map((d) => new Date(d!).getTime())
      .reduce((a, b) => Math.max(a, b), 0)
    setHasUnreadFromAdmin(lastAdmin > 0)
  }

  async function refreshOrders() {
    const { orders } = await getMyRecentOrders()
    setMyOrders(orders)
  }

  // -------------------------------------------------------------------------
  // Realtime : nouveaux messages du ticket actif
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!open || !activeTicket || !userId) return
    const channel = supabase
      .channel(`support-${activeTicket.id}-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${activeTicket.id}` },
        (payload) => {
          setMessages((cur) => {
            if (cur.find((m) => m.id === (payload.new as any).id)) return cur
            return [...cur, payload.new as SupportMessage]
          })
          if ((payload.new as any).sender_role === 'admin') {
            setHasUnreadFromAdmin(true)
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [open, activeTicket, userId, supabase])

  useEffect(() => {
    if (!open) return
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [messages, open, mode])

  // -------------------------------------------------------------------------
  // Ouvrir un ticket (passe en mode conversation)
  // -------------------------------------------------------------------------
  async function openTicket(t: SupportTicket) {
    setError(null)
    setActiveTicket(t)
    setMode('conversation')
    const { messages } = await getTicketMessages(t.id)
    setMessages(messages)
    setReplyBody('')
    setReplyAttachment(null)
  }

  // -------------------------------------------------------------------------
  // Création d'un nouveau ticket
  // -------------------------------------------------------------------------
  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!newSubject.trim()) {
      setError('Le sujet est obligatoire.')
      return
    }
    if (!newBody.trim() && !newAttachment) {
      setError('Écris un message ou joins un fichier.')
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      fd.append('subject', newSubject.trim())
      fd.append('category', newCategory)
      fd.append('priority', newPriority)
      fd.append('message', newBody.trim())
      fd.append('order_id', newOrderId)
      if (newAttachment) {
        fd.append('attachment_path', newAttachment.path)
        fd.append('attachment_name', newAttachment.name)
        fd.append('attachment_size', String(newAttachment.size))
        fd.append('attachment_mime', newAttachment.mime)
      }
      const res = await createTicket(fd)
      if (!res.ok || !res.ticketId) {
        setError(res.error || 'Erreur inconnue.')
        return
      }
      // Reset form
      setNewSubject('')
      setNewCategory('question')
      setNewPriority('normal')
      setNewBody('')
      setNewAttachment(null)
      setNewOrderId('none')
      await refreshTickets()
      // Ouvrir directement le ticket créé
      const created = (await getMyTickets()).tickets.find((t) => t.id === res.ticketId)
      if (created) openTicket(created)
      else setMode('list')
    })
  }

  // -------------------------------------------------------------------------
  // Envoi d'une réponse dans un ticket
  // -------------------------------------------------------------------------
  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!activeTicket) return
    if (!replyBody.trim() && !replyAttachment) {
      setError('Message vide.')
      return
    }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.append('ticket_id', activeTicket.id)
      fd.append('content', replyBody.trim())
      if (replyAttachment) {
        fd.append('attachment_path', replyAttachment.path)
        fd.append('attachment_name', replyAttachment.name)
        fd.append('attachment_size', String(replyAttachment.size))
        fd.append('attachment_mime', replyAttachment.mime)
      }
      const res = await sendSupportMessage(fd)
      if (!res.ok) {
        setError(res.error || 'Erreur inconnue.')
        return
      }
      setReplyBody('')
      setReplyAttachment(null)
      // Mettre à jour le statut local
      setActiveTicket({ ...activeTicket, status: 'pending', last_user_reply_at: new Date().toISOString() })
    })
  }

  // -------------------------------------------------------------------------
  // Upload d'une pièce jointe
  // -------------------------------------------------------------------------
  async function handleFile(file: File | null, mode: 'new' | 'reply') {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 MB).')
      return
    }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('ticket_id', activeTicket?.id || 'pending')
      const res = await uploadSupportAttachment(fd)
      if (!res.ok || !res.path) {
        setError(res.error || 'Upload impossible.')
        return
      }
      const meta = { path: res.path, name: res.name!, size: res.size!, mime: res.mime! }
      if (mode === 'new') setNewAttachment(meta)
      else setReplyAttachment(meta)
    })
  }

  // -------------------------------------------------------------------------
  // Fermer le ticket
  // -------------------------------------------------------------------------
  function handleCloseTicket() {
    if (!activeTicket) return
    startTransition(async () => {
      const res = await closeTicket(activeTicket.id)
      if (res.ok) {
        setActiveTicket({ ...activeTicket, status: 'closed' })
        await refreshTickets()
      } else {
        setError(res.error || 'Erreur.')
      }
    })
  }

  // -------------------------------------------------------------------------
  // Affichage d'une pièce jointe (signed URL)
  // -------------------------------------------------------------------------
  async function openAttachment(path: string) {
    const { url } = await signAttachmentUrl(path)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  // -------------------------------------------------------------------------
  // Rendu
  // -------------------------------------------------------------------------
  if (isExcluded) return null

  const categories = categoriesForRole((userRole as any) || 'buyer')

  return (
    <>
      {/* Bulle */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o)
          setMode('list')
          setError(null)
          if (!open) setHasUnreadFromAdmin(false)
        }}
        aria-label="Support Eden"
        className="fixed z-[90] bottom-5 right-5 md:bottom-7 md:right-7 w-14 h-14 md:w-16 md:h-16 bg-black text-white border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:bg-red-600 hover:border-red-600 transition-colors flex items-center justify-center group"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 1 1 18 0Z" strokeLinejoin="round" strokeLinecap="round" /></svg>
        )}
        {hasUnreadFromAdmin && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed z-[95] bottom-24 right-3 left-3 md:left-auto md:right-7 md:bottom-28 md:w-[420px] max-h-[80vh] bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col"
          role="dialog"
          aria-label="Support Eden"
        >
          {/* Header */}
          <div className="bg-black text-white p-4 flex items-center justify-between border-b-2 border-black">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white text-black flex items-center justify-center font-montserrat font-black border-2 border-white">E</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Service client</p>
                <h2 className="font-montserrat font-black uppercase tracking-wide text-sm">Support Eden</h2>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="text-white hover:text-red-600 transition-colors text-2xl leading-none"
            >×</button>
          </div>

          {/* Contenu */}
          {isAuthed === false ? (
            <NotAuthedPanel onClose={() => setOpen(false)} />
          ) : isAuthed === null ? (
            <div className="p-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400">Chargement…</div>
          ) : mode === 'list' ? (
            <ListPanel
              tickets={tickets}
              onOpen={openTicket}
              onNew={() => {
                setMode('new')
                setError(null)
              }}
              onClose={() => setOpen(false)}
            />
          ) : mode === 'new' ? (
            <NewTicketPanel
              categories={categories}
              subject={newSubject}
              setSubject={setNewSubject}
              category={newCategory}
              setCategory={setNewCategory}
              priority={newPriority}
              setPriority={setNewPriority}
              body={newBody}
              setBody={setNewBody}
              attachment={newAttachment}
              onFile={(f) => handleFile(f, 'new')}
              error={error}
              isPending={isPending}
              onSubmit={handleCreateTicket}
              onBack={() => setMode('list')}
              orderId={newOrderId}
              setOrderId={setNewOrderId}
              orders={myOrders}
            />
          ) : (
            <ConversationPanel
              ticket={activeTicket!}
              messages={messages}
              currentUserId={userId!}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              replyAttachment={replyAttachment}
              onFile={(f) => handleFile(f, 'reply')}
              onSend={handleReply}
              onCloseTicket={handleCloseTicket}
              onBack={() => {
                setMode('list')
                setActiveTicket(null)
                setMessages([])
              }}
              error={error}
              isPending={isPending}
              onOpenAttachment={openAttachment}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>
      )}
    </>
  )
}

// ============================================================================
// Sous-composants
// ============================================================================

function NotAuthedPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6 text-center space-y-4">
      <div className="text-4xl">👋</div>
      <h3 className="font-montserrat font-black uppercase tracking-wide text-base">Connecte-toi pour nous écrire</h3>
      <p className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
        Le support Eden te répond directement sur la plateforme, où que tu sois sur le site.
      </p>
      <div className="flex flex-col gap-3 pt-2">
        <Link href="/login" onClick={onClose} className="block w-full py-3 bg-black text-white font-montserrat font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-red-600 hover:border-red-600 transition-colors">
          Se connecter
        </Link>
        <Link href="/signup" onClick={onClose} className="block w-full py-3 bg-white text-black font-montserrat font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-gray-50 transition-colors">
          Créer un compte
        </Link>
      </div>
    </div>
  )
}

function ListPanel({
  tickets,
  onOpen,
  onNew,
  onClose,
}: {
  tickets: SupportTicket[]
  onOpen: (t: SupportTicket) => void
  onNew: () => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col max-h-[70vh]">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {tickets.length === 0 ? 'Aucun échange' : `${tickets.length} conversation${tickets.length > 1 ? 's' : ''}`}
        </p>
        <button
          onClick={onNew}
          className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-2 hover:bg-red-600 transition-colors"
        >
          + Nouveau
        </button>
      </div>
      <div className="overflow-y-auto flex-1">
        {tickets.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="text-4xl">💬</div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 leading-relaxed">
              Besoin d'aide ?<br />Démarre une nouvelle conversation avec notre équipe.
            </p>
            <button
              onClick={onNew}
              className="w-full py-3 bg-black text-white font-montserrat font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-red-600 hover:border-red-600 transition-colors"
            >
              Démarrer une conversation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((t) => {
              const cat = getCategoryMeta(t.category)
              const statusColor =
                t.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-700' :
                t.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-700' :
                t.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-700' :
                'bg-gray-100 text-gray-500 border-gray-400'
              return (
                <button
                  key={t.id}
                  onClick={() => onOpen(t)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base shrink-0">{cat.icon}</span>
                        <p className="font-bold text-sm text-black truncate">{t.subject}</p>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {cat.label} • {new Date(t.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest border px-1.5 py-0.5 ${statusColor}`}>
                      {t.status === 'open' ? 'Ouvert' : t.status === 'pending' ? 'En cours' : t.status === 'resolved' ? 'Résolu' : 'Fermé'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
        <button
          onClick={onClose}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

function NewTicketPanel(props: {
  categories: ReturnType<typeof categoriesForRole>
  subject: string
  setSubject: (v: string) => void
  category: SupportCategoryKey
  setCategory: (v: SupportCategoryKey) => void
  priority: 'low' | 'normal' | 'high' | 'urgent'
  setPriority: (v: 'low' | 'normal' | 'high' | 'urgent') => void
  body: string
  setBody: (v: string) => void
  attachment: { path: string; name: string; size: number; mime: string } | null
  onFile: (f: File | null) => void
  error: string | null
  isPending: boolean
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  orderId: string
  setOrderId: (v: string) => void
  orders: UserOrderRef[]
}) {
  return (
    <form onSubmit={props.onSubmit} className="flex flex-col max-h-[70vh]">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <button type="button" onClick={props.onBack} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
          ← Retour
        </button>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nouveau ticket</p>
      </div>
      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Sujet *</label>
          <input
            value={props.subject}
            onChange={(e) => props.setSubject(e.target.value)}
            placeholder="Ex: Ma commande n'est pas reçue"
            className="w-full p-3 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors rounded-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-tight text-gray-500 mb-1">Motif</label>
            <select
              value={props.category}
              onChange={(e) => props.setCategory(e.target.value as SupportCategoryKey)}
              className="w-full px-2.5 py-2 text-[11px] font-bold text-black border border-gray-300 outline-none focus:border-black bg-white rounded-none cursor-pointer leading-tight"
            >
              {props.categories.map((c) => (
                <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-tight text-gray-500 mb-1">Priorité</label>
            <select
              value={props.priority}
              onChange={(e) => props.setPriority(e.target.value as any)}
              className="w-full px-2.5 py-2 text-[11px] font-bold text-black border border-gray-300 outline-none focus:border-black bg-white rounded-none cursor-pointer leading-tight"
            >
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-tight text-gray-500 mb-1">
            📦 Référence commande <span className="opacity-60">(facultatif)</span>
          </label>
          {props.orders.length === 0 ? (
            <p className="text-[10px] text-gray-400 italic px-1 py-1.5">
              Aucune commande récente — tu pourras quand même créer ton ticket.
            </p>
          ) : (
            <select
              value={props.orderId}
              onChange={(e) => props.setOrderId(e.target.value)}
              className="w-full px-2.5 py-2 text-[11px] font-bold text-black border border-gray-300 outline-none focus:border-black bg-white rounded-none cursor-pointer leading-tight"
            >
              <option value="none">— Aucune commande à référencer —</option>
              {props.orders.map((o) => {
                const date = new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                const amount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(o.total_amount)
                const status = ORDER_STATUS_LABELS[o.status] || o.status
                const label = `#${o.id.slice(0, 8).toUpperCase()} • ${date} • ${amount} • ${o.items_count} art.${o.items_count > 1 ? 's' : ''} • ${status}${o.shop_name ? ` • ${o.shop_name}` : ''}`
                return <option key={o.id} value={o.id}>{label}</option>
              })}
            </select>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Message</label>
          <textarea
            value={props.body}
            onChange={(e) => props.setBody(e.target.value)}
            rows={5}
            placeholder="Décris ta demande aussi précisément que possible…"
            className="w-full p-3 text-sm text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors rounded-none resize-none"
          />
        </div>
        <AttachmentField attachment={props.attachment} onFile={props.onFile} />
        {props.error && (
          <div className="p-3 bg-red-50 border-2 border-red-600 text-red-700 text-xs font-bold uppercase tracking-wide">{props.error}</div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          type="submit"
          disabled={props.isPending}
          className="w-full py-3 bg-red-600 text-white font-montserrat font-black uppercase tracking-widest text-xs border-2 border-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {props.isPending ? 'Envoi…' : 'Envoyer ma demande'}
        </button>
      </div>
    </form>
  )
}

function ConversationPanel(props: {
  ticket: SupportTicket
  messages: SupportMessage[]
  currentUserId: string
  replyBody: string
  setReplyBody: (v: string) => void
  replyAttachment: { path: string; name: string; size: number; mime: string } | null
  onFile: (f: File | null) => void
  onSend: (e: React.FormEvent) => void
  onCloseTicket: () => void
  onBack: () => void
  error: string | null
  isPending: boolean
  onOpenAttachment: (path: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}) {
  const isClosed = props.ticket.status === 'closed'
  const cat = getCategoryMeta(props.ticket.category)

  return (
    <div className="flex flex-col max-h-[70vh]">
      {/* Header du ticket */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={props.onBack} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
            ← Retour
          </button>
          {!isClosed && (
            <button
              type="button"
              onClick={props.onCloseTicket}
              disabled={props.isPending}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
            >
              Clôturer
            </button>
          )}
        </div>
        <p className="font-montserrat font-black uppercase tracking-wide text-sm text-black truncate">{props.ticket.subject}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
          {cat.icon} {cat.label} • {props.ticket.priority === 'urgent' ? '🚨 Urgent' : props.ticket.priority}
        </p>
        {props.ticket.order_id && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mt-1">
            📦 Commande référencée : <span className="font-black">#{props.ticket.order_id.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {props.messages.length === 0 ? (
          <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mt-6">
            Pas encore de réponse.
          </p>
        ) : (
          props.messages.map((m) => {
            const isMe = m.sender_role === 'user'
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 border-2 ${isMe ? 'bg-black text-white border-black' : 'bg-gray-50 text-black border-gray-300'}`}>
                  {!isMe && (
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1.5 text-red-600">Support Eden</p>
                  )}
                  {m.content && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>}
                  {m.attachment_path && (
                    <button
                      onClick={() => props.onOpenAttachment(m.attachment_path!)}
                      className={`mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border ${isMe ? 'border-white/40 hover:border-white' : 'border-black/30 hover:border-black'} px-2 py-1 transition-colors`}
                    >
                      📎 {m.attachment_name || 'Pièce jointe'} <span className="opacity-60">({Math.round((m.attachment_size || 0) / 1024)} KB)</span>
                    </button>
                  )}
                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(m.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={props.messagesEndRef} />
      </div>

      {/* Reply form */}
      {isClosed ? (
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
          Cette conversation est fermée.
        </div>
      ) : (
        <form onSubmit={props.onSend} className="p-3 border-t border-gray-200 bg-gray-50 space-y-2">
          <AttachmentField attachment={props.replyAttachment} onFile={props.onFile} compact />
          <textarea
            value={props.replyBody}
            onChange={(e) => props.setReplyBody(e.target.value)}
            rows={2}
            placeholder="Ta réponse…"
            className="w-full p-2.5 text-sm text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 rounded-none resize-none"
          />
          {props.error && <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide">{props.error}</p>}
          <button
            type="submit"
            disabled={props.isPending}
            className="w-full py-2.5 bg-black text-white font-montserrat font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-red-600 hover:border-red-600 transition-colors disabled:opacity-50"
          >
            {props.isPending ? '…' : 'Envoyer'}
          </button>
        </form>
      )}
    </div>
  )
}

function AttachmentField({
  attachment,
  onFile,
  compact,
}: {
  attachment: { path: string; name: string; size: number; mime: string } | null
  onFile: (f: File | null) => void
  compact?: boolean
}) {
  return (
    <div>
      <label className={`block ${compact ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-widest text-gray-500 mb-1`}>
        📎 Pièce jointe (max 10 MB)
      </label>
      {attachment ? (
        <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
          <span className="text-[10px] font-bold uppercase tracking-widest truncate">{attachment.name} <span className="opacity-50">({Math.round(attachment.size / 1024)} KB)</span></span>
          <button type="button" onClick={() => onFile(null)} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800">×</button>
        </div>
      ) : (
        <input
          type="file"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
          className="w-full text-[10px] font-bold uppercase tracking-widest file:mr-3 file:py-2 file:px-3 file:border-2 file:border-black file:bg-white file:text-black file:font-black file:uppercase file:tracking-widest file:text-[10px] hover:file:bg-black hover:file:text-white file:cursor-pointer"
        />
      )}
    </div>
  )
}
