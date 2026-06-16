import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminTicketDetail } from '@/app/actions/adminSupportActions'
import { getCategoryMeta } from '@/utils/supportCategories'
import AdminTicketChat from './AdminTicketChat'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  open: 'Ouvert',
  pending: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params
  const { ticket, messages, user, order } = await getAdminTicketDetail(ticketId)

  if (!ticket) notFound()

  const cat = getCategoryMeta(ticket.category)

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-6 flex flex-col gap-2">
        <Link
          href="/admin/support"
          className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline w-fit"
        >
          ← Retour à la liste
        </Link>
        <h1 className="text-2xl md:text-3xl font-montserrat font-black text-black uppercase tracking-tight">
          {ticket.subject}
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {cat.icon} {cat.label} • Ticket #{ticket.id.substring(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Bandeau d'infos user */}
      <div className="bg-white border-2 border-black p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Demandé par</p>
          <p className="font-montserrat font-black text-black uppercase tracking-wide">
            {user?.full_name || '—'}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
            {user?.email || ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`text-[10px] font-black uppercase tracking-widest border-2 px-2 py-1 ${
            ticket.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-700' :
            ticket.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-700' :
            ticket.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-700' :
            'bg-gray-100 text-gray-500 border-gray-400'
          }`}>
            {STATUS_LABELS[ticket.status] || ticket.status}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest border-2 px-2 py-1 ${
            ticket.priority === 'urgent' ? 'bg-red-600 text-white border-red-600' :
            ticket.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-700' :
            ticket.priority === 'low' ? 'bg-white text-gray-500 border-gray-300' :
            'bg-white text-black border-black'
          }`}>
            Priorité : {ticket.priority === 'urgent' ? '🚨 Urgent' : ticket.priority}
          </span>
        </div>
      </div>

      {/* Bandeau commande référencée */}
      {order && (
        <div className="bg-red-50 border-2 border-red-600 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1">📦 Commande référencée</p>
              <p className="font-montserrat font-black text-black uppercase tracking-wide text-base">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                {order.customer_name ? `Client : ${order.customer_name}` : ''}
                {order.shop_name ? ` • Boutique : ${order.shop_name}` : ''}
                {' • '}
                Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                {' • '}
                {formatAmount(order.total_amount)}
              </p>
            </div>
            <span className={`shrink-0 inline-block text-[10px] font-black uppercase tracking-widest border-2 px-3 py-1.5 ${
              order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-700' :
              order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-700' :
              order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-700' :
              order.status === 'processing' ? 'bg-purple-50 text-purple-700 border-purple-700' :
              'bg-yellow-50 text-yellow-700 border-yellow-700'
            }`}>
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
        </div>
      )}

      <AdminTicketChat
        ticketId={ticket.id}
        ticketStatus={ticket.status}
        ticketPriority={ticket.priority}
        initialMessages={messages}
      />
    </div>
  )
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)
}
