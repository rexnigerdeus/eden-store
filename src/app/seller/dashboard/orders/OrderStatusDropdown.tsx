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

  // Couleurs brutalistes selon le statut
  let bgColor = 'bg-white text-black border-black'
  if (status === 'processing') bgColor = 'bg-gray-200 text-black border-gray-400'
  if (status === 'shipped') bgColor = 'bg-black text-white border-black'
  if (status === 'delivered') bgColor = 'bg-green-600 text-white border-green-600'
  if (status === 'cancelled') bgColor = 'bg-red-600 text-white border-red-600'

  return (
    <div className="relative">
      <select
        value={status}
        onChange={handleChange}
        disabled={isUpdating}
        className={`appearance-none font-bold text-xs uppercase tracking-widest rounded-none px-4 py-3 pr-10 outline-none border-2 focus:ring-0 cursor-pointer transition-colors ${bgColor} ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value} className="bg-white text-black font-bold uppercase">{s.label}</option>
        ))}
      </select>
      
      {/* Flèche du dropdown adaptée à la couleur de fond */}
      <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${status === 'shipped' || status === 'delivered' || status === 'cancelled' ? 'text-white' : 'text-black'}`}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}