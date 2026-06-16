'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  adminSendMessage,
  updateTicketStatus,
  updateTicketPriority,
  assignTicketToMe,
} from '@/app/actions/adminSupportActions'
import { uploadSupportAttachment, signAttachmentUrl } from '@/app/actions/supportActions'
import type { SupportMessage } from '@/app/actions/supportActions'

const STATUS_OPTIONS = [
  { value: 'open', label: 'Ouvert' },
  { value: 'pending', label: 'En cours' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'closed', label: 'Fermé' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'normal', label: 'Normale' },
  { value: 'high', label: 'Haute' },
  { value: 'urgent', label: '🚨 Urgente' },
]

export default function AdminTicketChat({
  ticketId,
  ticketStatus,
  ticketPriority,
  initialMessages,
}: {
  ticketId: string
  ticketStatus: string
  ticketPriority: string
  initialMessages: SupportMessage[]
}) {
  const supabase = createClient()
  const router = useRouter()

  const [messages, setMessages] = useState<SupportMessage[]>(initialMessages || [])
  const [reply, setReply] = useState('')
  const [attachment, setAttachment] = useState<{ path: string; name: string; size: number; mime: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(ticketStatus)
  const [priority, setPriority] = useState(ticketPriority)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel(`admin-support-${ticketId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticketId}` },
        (payload) => {
          setMessages((cur) => {
            if (cur.find((m) => m.id === (payload.new as any).id)) return cur
            return [...cur, payload.new as SupportMessage]
          })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, supabase])

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [messages])

  async function handleFile(file: File | null) {
    if (!file) {
      setAttachment(null)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 MB).')
      return
    }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('ticket_id', ticketId)
      const res = await uploadSupportAttachment(fd)
      if (!res.ok || !res.path) {
        setError(res.error || 'Upload impossible.')
        return
      }
      setAttachment({ path: res.path, name: res.name!, size: res.size!, mime: res.mime! })
    })
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim() && !attachment) {
      setError('Message vide.')
      return
    }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.append('ticket_id', ticketId)
      fd.append('content', reply.trim())
      if (attachment) {
        fd.append('attachment_path', attachment.path)
        fd.append('attachment_name', attachment.name)
        fd.append('attachment_size', String(attachment.size))
        fd.append('attachment_mime', attachment.mime)
      }
      const res = await adminSendMessage(fd)
      if (!res.ok) {
        setError(res.error || 'Erreur.')
        return
      }
      setReply('')
      setAttachment(null)
      setStatus('pending')
      router.refresh()
    })
  }

  function changeStatus(newStatus: string) {
    setStatus(newStatus)
    startTransition(async () => {
      await updateTicketStatus(ticketId, newStatus)
      router.refresh()
    })
  }

  function changePriority(newPriority: string) {
    setPriority(newPriority)
    startTransition(async () => {
      await updateTicketPriority(ticketId, newPriority)
      router.refresh()
    })
  }

  function handleAssign() {
    startTransition(async () => {
      await assignTicketToMe(ticketId)
      router.refresh()
    })
  }

  async function openAttachment(path: string) {
    const { url } = await signAttachmentUrl(path)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white border-2 border-black flex flex-col h-[640px]">
      {/* Toolbar admin */}
      <div className="border-b-2 border-black p-3 flex flex-wrap items-center gap-3 bg-gray-50">
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-tight text-gray-500">Statut</label>
          <select
            value={status}
            onChange={(e) => changeStatus(e.target.value)}
            disabled={isPending}
            className="text-[11px] font-bold border border-black bg-white pl-1.5 pr-6 py-1 outline-none focus:border-red-600 rounded-none cursor-pointer leading-tight"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-tight text-gray-500">Priorité</label>
          <select
            value={priority}
            onChange={(e) => changePriority(e.target.value)}
            disabled={isPending}
            className="text-[11px] font-bold border border-black bg-white pl-1.5 pr-6 py-1 outline-none focus:border-red-600 rounded-none cursor-pointer leading-tight"
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleAssign}
          disabled={isPending}
          className="ml-auto px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-widest border-2 border-black hover:bg-red-600 hover:border-red-600 transition-colors disabled:opacity-50"
        >
          M'assigner
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mt-10">
            Aucun message pour le moment.
          </p>
        ) : (
          messages.map((m) => {
            const isAdmin = m.sender_role === 'admin'
            return (
              <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 border-2 ${isAdmin ? 'bg-red-600 text-white border-red-600' : 'bg-gray-50 text-black border-gray-300'}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${isAdmin ? 'text-white/80' : 'text-red-600'}`}>
                    {isAdmin ? 'Support Eden' : 'Utilisateur'}
                  </p>
                  {m.content && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>}
                  {m.attachment_path && (
                    <button
                      onClick={() => openAttachment(m.attachment_path!)}
                      className={`mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border px-2 py-1 transition-colors ${isAdmin ? 'border-white/40 hover:border-white' : 'border-black/30 hover:border-black'}`}
                    >
                      📎 {m.attachment_name || 'Pièce jointe'} <span className="opacity-60">({Math.round((m.attachment_size || 0) / 1024)} KB)</span>
                    </button>
                  )}
                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${isAdmin ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(m.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply form */}
      <form onSubmit={handleSend} className="p-3 border-t-2 border-black bg-gray-50 space-y-2">
        {attachment && (
          <div className="flex items-center justify-between p-2 border-2 border-black bg-white">
            <span className="text-[10px] font-bold uppercase tracking-widest truncate">
              📎 {attachment.name} <span className="opacity-50">({Math.round(attachment.size / 1024)} KB)</span>
            </span>
            <button type="button" onClick={() => setAttachment(null)} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800">×</button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            placeholder="Réponse du support Eden…"
            className="flex-1 p-3 text-sm text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 rounded-none resize-none"
          />
          <div className="flex sm:flex-col gap-2">
            <label className="cursor-pointer flex-1 sm:flex-none px-3 py-2 bg-white border-2 border-gray-300 hover:border-black text-[10px] font-black uppercase tracking-widest text-center transition-colors">
              📎 Joindre
              <input
                type="file"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-none px-5 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest border-2 border-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isPending ? '…' : 'Répondre'}
            </button>
          </div>
        </div>
        {error && <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide">{error}</p>}
      </form>
    </div>
  )
}
