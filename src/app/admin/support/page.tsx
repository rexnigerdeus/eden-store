import Link from 'next/link'
import { listAllTickets, type AdminTicketRow } from '@/app/actions/adminSupportActions'
import { getCategoryMeta } from '@/utils/supportCategories'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  open: 'Ouvert',
  pending: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-700',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-700',
  resolved: 'bg-green-50 text-green-700 border-green-700',
  closed: 'bg-gray-100 text-gray-500 border-gray-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-white text-gray-500 border-gray-300',
  normal: 'bg-white text-black border-black',
  high: 'bg-orange-50 text-orange-700 border-orange-700',
  urgent: 'bg-red-600 text-white border-red-600',
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const sp = await searchParams
  const status = sp.status || 'all'
  const q = sp.q || ''

  const { tickets, counts } = await listAllTickets({ status, search: q })

  const tabs = [
    { key: 'all', label: 'Tous', count: Object.values(counts).reduce((a, b) => a + b, 0) },
    { key: 'open', label: 'Ouverts', count: counts.open || 0 },
    { key: 'pending', label: 'En cours', count: counts.pending || 0 },
    { key: 'resolved', label: 'Résolus', count: counts.resolved || 0 },
    { key: 'closed', label: 'Fermés', count: counts.closed || 0 },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">
            Support Eden
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">
            Conversations ouvertes avec les acheteurs et les vendeurs.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors border-2 border-gray-200 hover:border-black px-3 py-2"
        >
          ← Supervision
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = status === t.key
            return (
              <Link
                key={t.key}
                href={`/admin/support?status=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-colors ${
                  active
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                {t.label} <span className="opacity-60">({t.count})</span>
              </Link>
            )
          })}
        </div>
        <form className="flex gap-2">
          <input
            type="hidden"
            name="status"
            value={status}
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Rechercher (sujet, nom, email, motif)…"
            className="flex-1 lg:w-80 px-4 py-2 text-xs font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 rounded-none uppercase tracking-widest"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest border-2 border-black hover:bg-red-600 hover:border-red-600 transition-colors"
          >
            OK
          </button>
        </form>
      </div>

      {/* Liste */}
      <div className="bg-white border-2 border-black">
        {tickets.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
            Aucun ticket pour ce filtre.
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-100">
            {tickets.map((t) => (
              <TicketRow key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TicketRow({ ticket }: { ticket: AdminTicketRow }) {
  const cat = getCategoryMeta(ticket.category)
  return (
    <Link
      href={`/admin/support/${ticket.id}`}
      className="block p-5 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="text-2xl shrink-0">{cat.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-montserrat font-black text-black uppercase tracking-wide truncate">
                {ticket.subject}
              </p>
              {ticket.unread_for_admin && (
                <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border border-red-600 animate-pulse">
                  Nouveau
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
              {cat.label} • {ticket.user_full_name || ticket.user_email || 'Utilisateur'}
              {ticket.user_full_name && ticket.user_email ? ` • ${ticket.user_email}` : ''}
            </p>
            {ticket.order_id && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mt-0.5">
                📦 Commande #{ticket.order_id.slice(0, 8).toUpperCase()}
              </p>
            )}
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
              Mis à jour le {new Date(ticket.updated_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 ${STATUS_COLORS[ticket.status]}`}>
            {STATUS_LABELS[ticket.status] || ticket.status}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 ${PRIORITY_COLORS[ticket.priority]}`}>
            {ticket.priority === 'urgent' ? '🚨 Urgent' : ticket.priority}
          </span>
        </div>
      </div>
    </Link>
  )
}
