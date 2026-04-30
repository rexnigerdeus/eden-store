'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useEffect, useState } from 'react'

export default function CartIcon() {
  const { cartCount } = useCart()
  const [mounted, setMounted] = useState(false)

  // Anti-erreur d'hydratation (car le panier lit le localStorage)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative text-gray-600 p-1 flex items-center justify-center">
        <span className="text-xl opacity-50">🛒</span>
      </div>
    )
  }

  return (
    <Link href="/cart" className="relative text-gray-600 hover:text-walmart-blue transition-colors p-1 flex items-center justify-center group">
      <span className="text-xl transition-transform group-hover:scale-110">🛒</span>
      
      {/* Pastille du nombre d'articles */}
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-walmart-blue text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm">
          {cartCount}
        </span>
      )}
    </Link>
  )
}