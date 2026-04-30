'use client'

import { useState } from 'react'
import { updateOrderStatus } from './actions'

const statuses = [
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]

export default function OrderStatusDropdown({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    setStatus(newStatus)
    setIsUpdating(true)
    
    await updateOrderStatus(orderId, newStatus)
    
    setIsUpdating(false)
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={handleChange}
        disabled={isUpdating}
        className={`appearance-none font-medium text-sm rounded-full px-4 py-2 pr-8 outline-none border border-transparent focus:ring-2 focus:ring-walmart-blue transition-colors cursor-pointer ${
          status === 'pending' ? 'bg-orange-100 text-orange-800' :
          status === 'processing' ? 'bg-blue-100 text-blue-800' :
          status === 'shipped' ? 'bg-purple-100 text-purple-800' :
          status === 'delivered' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {/* Petite flèche personnalisée pour le select */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  )
}