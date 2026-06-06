'use client'

import { useEffect, useState } from 'react'

/**
 * A "live" online users counter shown in the top announcement bar.
 *
 * The number is fake (client-side, randomized within a realistic range) and
 * fluctuates every few seconds to feel like a real-time feed. It does NOT
 * query the database — it is purely decorative. Replace the logic with a
 * Supabase Realtime / presence channel when you want it for real.
 */
export default function LiveOnlineCounter() {
  const [count, setCount] = useState<number | null>(null)

  // Initialize on mount so SSR + first client render match (no hydration mismatch)
  useEffect(() => {
    setCount(120 + Math.floor(Math.random() * 80))

    const interval = setInterval(() => {
      setCount((prev) => {
        const base = prev ?? 160
        // Drift between -7 and +9 so the number slowly trends upward
        const delta = Math.floor(Math.random() * 17) - 7
        const next = base + delta
        // Keep the value inside a believable range
        return Math.max(85, Math.min(420, next))
      })
    }, 4000 + Math.random() * 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-black text-white text-[11px] sm:text-xs font-bold text-center py-2 uppercase tracking-[0.2em] w-full flex items-center justify-center gap-3">
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>
        <span className="text-green-400">
          {count === null ? '…' : count.toLocaleString('fr-FR')}
        </span>{' '}
        personnes connectées en ce moment
      </span>
    </div>
  )
}
