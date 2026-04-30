'use client'

import { useState } from 'react'

export default function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erreur de copie', err)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className={`ml-3 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1 ${
        copied ? 'bg-green-100 text-green-700' : 'bg-walmart-light text-walmart-blue hover:bg-blue-100'
      }`}
    >
      <span>{copied ? '✅ Copié !' : '📋 Copier'}</span>
    </button>
  )
}