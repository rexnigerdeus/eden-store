'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    // Si l'utilisateur a tapé quelque chose, on le redirige vers la page /search
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un produit..."
        className="w-full pl-5 pr-12 py-3 bg-gray-100 text-gray-900 border-transparent rounded-full focus:bg-white focus:border-walmart-blue focus:ring-2 focus:ring-walmart-blue outline-none transition-all"
      />
      <button 
        type="submit" 
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-walmart-blue hover:text-walmart-darkBlue transition-colors"
      >
        🔍
      </button>
    </form>
  )
}