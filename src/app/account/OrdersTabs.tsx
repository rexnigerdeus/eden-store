'use client'

import { useState } from 'react'
import Link from 'next/link'

interface OrderItem {
  quantity: number
  price_at_time: number
  products: {
    title: string
    cover_image_url: string
  } | null
}

interface Order {
  id: string
  created_at: string
  status: string
  total_amount: number
  customer_phone: string
  shops: {
    id: string
    name: string
    slug: string
    whatsapp: string
  } | null
  order_items: OrderItem[]
}

const statusConfig: Record<string, { label: string, color: string }> = {
  pending: { label: 'En attente', color: 'bg-white text-black border-black' },
  processing: { label: 'En préparation', color: 'bg-gray-200 text-black border-gray-400' },
  shipped: { label: 'Expédiée', color: 'bg-black text-white border-black' },
  delivered: { label: 'Livrée', color: 'bg-green-600 text-white border-green-600' },
  cancelled: { label: 'Annulée', color: 'bg-red-600 text-white border-red-600' },
}

export default function OrdersTabs({ orders }: { orders: Order[] }) {
  const [activeTab, setActiveTab] = useState<'in-progress' | 'delivered'>('in-progress')

  // Commandes en cours = tout sauf "delivered" et "cancelled"
  const inProgressOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  )
  // Commandes terminées = "delivered" ET "cancelled" (annulées sont aussi "finies")
  const finishedOrders = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  )

  const currentOrders = activeTab === 'in-progress' ? inProgressOrders : finishedOrders

  const tabBaseClasses =
    'flex-1 sm:flex-none px-4 sm:px-6 py-3 text-xs sm:text-sm font-montserrat font-black uppercase tracking-widest border-2 border-black transition-colors text-center'
  const tabActiveClasses = 'bg-black text-white'
  const tabInactiveClasses = 'bg-white text-black hover:bg-gray-100'

  return (
    <div>
      {/* BARRE D'ONGLETS */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('in-progress')}
          className={`${tabBaseClasses} ${activeTab === 'in-progress' ? tabActiveClasses : tabInactiveClasses}`}
        >
          En cours ({inProgressOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('delivered')}
          className={`${tabBaseClasses} ${activeTab === 'delivered' ? tabActiveClasses : tabInactiveClasses}`}
        >
          Terminées ({finishedOrders.length})
        </button>
      </div>

      {/* LISTE DES COMMANDES */}
      {currentOrders.length > 0 ? (
        <div className="space-y-8">
          {currentOrders.map((order) => {
            const isDelivered = order.status === 'delivered'
            return (
              <div
                key={order.id}
                className={`bg-white border-2 border-black flex flex-col transition-all ${
                  isDelivered ? 'opacity-60 grayscale-[30%]' : ''
                }`}
              >
                {/* En-tête de la facture client */}
                <div className="bg-gray-50 p-4 md:p-6 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-black uppercase tracking-widest">
                      Date : {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-widest">Réf: {order.id}</p>
                  </div>
                  <div className="sm:text-right">
                    <span
                      className={`inline-block px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 ${
                        statusConfig[order.status]?.color || 'bg-white text-black border-black'
                      }`}
                    >
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </div>
                </div>

                {/* Corps de la commande */}
                <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
                  {/* Les articles */}
                  <div className="flex-1 space-y-4">
                    {order.order_items.map((item, index) => (
                      <div key={`item-${index}`} className="flex items-start space-x-4">
                        <div className="w-16 h-20 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                          {item.products?.cover_image_url ? (
                            <img
                              src={item.products.cover_image_url}
                              alt="Produit"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-montserrat font-bold text-gray-400 uppercase">
                              EDEN store
                            </div>
                          )}
                        </div>
                        <div className="pt-1">
                          <p className="font-bold text-xs text-black uppercase tracking-widest line-clamp-2">
                            {item.products?.title || 'Article indisponible'}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">
                            QTÉ: <span className="text-black">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Résumé vendeur et Actions */}
                  <div className="md:w-64 flex-shrink-0 flex flex-col justify-between pt-6 md:pt-0 border-t md:border-t-0 md:border-l md:border-gray-200 md:pl-8">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vendeur</p>
                      <Link
                        href={`/shop/${order.shops?.slug}`}
                        className="text-sm font-black text-black uppercase tracking-widest hover:underline block mb-4"
                      >
                        {order.shops?.name}
                      </Link>

                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Payé</p>
                      <p className="text-xl font-montserrat font-black text-red-600">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF',
                          maximumFractionDigits: 0,
                        }).format(order.total_amount)}
                      </p>
                    </div>

                    {/* Actions disponibles UNIQUEMENT pour les commandes NON livrées */}
                    {!isDelivered && (
                      <div className="mt-6 flex flex-col gap-3">
                        <Link
                          href={`/track?orderId=${order.id}&phone=${order.customer_phone}`}
                          className="w-full py-4 text-center text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-gray-900 transition-colors border-2 border-black"
                        >
                          Suivre le colis
                        </Link>
                        <Link
                          href={`/account/messages/${order.shops?.id}`}
                          className="w-full py-4 text-center text-[10px] font-black uppercase tracking-widest bg-white text-black border-2 border-black hover:bg-gray-50 transition-colors"
                        >
                          Contacter vendeur
                        </Link>
                      </div>
                    )}

                    {/* Mention commande terminée */}
                    {isDelivered && (
                      <div className="mt-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest border-t border-gray-200">
                        ✓ Commande terminée
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 border-2 border-black">
          <h3 className="text-xl md:text-2xl font-montserrat font-black text-black uppercase tracking-widest mb-4">
            {activeTab === 'in-progress' ? 'Aucune commande en cours' : 'Aucune commande terminée'}
          </h3>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">
            {activeTab === 'in-progress'
              ? 'Vous n\u2019avez pas de commande active pour le moment.'
              : 'Vos commandes livrées et annulées apparaîtront ici.'}
          </p>
          {activeTab === 'in-progress' && (
            <Link
              href="/"
              className="inline-block px-10 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors border-2 border-black"
            >
              Découvrir le catalogue
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
