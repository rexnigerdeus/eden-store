'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleSellerReminder } from '@/app/actions/adminSupportActions'

// ============================================================================
// Panneau d'activation du rappel vendeur + actions sur la liste ciblée.
// ============================================================================
export default function SellerReminderControls({
  initialEnabled,
  sellersWithoutShop,
}: {
  initialEnabled: boolean
  sellersWithoutShop: Array<{
    id: string
    full_name: string
    email: string
    created_at: string
  }>
}) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function toggle() {
    const prev = enabled
    setEnabled(!prev)
    startTransition(async () => {
      const res = await toggleSellerReminder()
      if (!res.ok) {
        setEnabled(prev)
      }
      router.refresh()
    })
  }

  function buildMailto(s: { email: string; full_name: string }) {
    const subject = encodeURIComponent('EDEN — Finalisez votre boutique')
    const body = encodeURIComponent(
      `Bonjour ${s.full_name.split(' ')[0]},\n\nVotre compte vendeur est créé sur Eden Market, mais votre boutique n'est pas encore configurée.\nProfitez de 14 jours offerts en finalisant votre inscription ici : https://edenmarket.com/seller/dashboard/settings\n\nL'équipe Eden.`
    )
    return `mailto:${s.email}?subject=${subject}&body=${body}`
  }

  async function copyEmail(email: string, id: string) {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedId(id)
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500)
    } catch {
      /* clipboard non dispo : no-op */
    }
  }

  return (
    <div className="space-y-6">
      {/* Toggle global */}
      <div className="bg-black text-white border-2 border-black p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rappel automatique</p>
          <p className="font-montserrat font-black uppercase tracking-tight text-base">
            Popup "Configurez votre boutique"
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2 leading-relaxed">
            Affichée à chaque connexion pour les vendeurs qui n'ont pas encore créé leur boutique.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          aria-pressed={enabled}
          className={`shrink-0 flex items-center gap-3 px-5 py-3 border-2 font-montserrat font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50 ${
            enabled ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' : 'bg-white text-black border-white hover:bg-red-600 hover:text-white hover:border-red-600'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${enabled ? 'bg-white' : 'bg-black'} border border-current`} />
          {enabled ? 'Activé' : 'Désactivé'}
        </button>
      </div>

      {/* Liste ciblée */}
      <div className="bg-white border-2 border-black">
        <div className="p-4 border-b-2 border-black bg-gray-50 flex items-center justify-between">
          <h2 className="text-xs font-montserrat font-black text-black uppercase tracking-widest">
            Vendeurs sans boutique ({sellersWithoutShop.length})
          </h2>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Action manuelle · mail ou copie email
          </span>
        </div>
        {sellersWithoutShop.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
            Aucun vendeur sans boutique. 🎉
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-100">
            {sellersWithoutShop.map((s) => {
              const initial = (s.full_name || s.email || '?').charAt(0).toUpperCase()
              return (
                <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gray-100 border-2 border-black flex items-center justify-center font-montserrat font-black uppercase shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-montserrat font-black text-sm text-black uppercase tracking-wider truncate">
                        {s.full_name}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">
                        {s.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyEmail(s.email, s.id)}
                      className="px-3 py-2 text-[10px] font-black uppercase tracking-widest border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
                    >
                      {copiedId === s.id ? 'Copié ✓' : 'Copier email'}
                    </button>
                    <a
                      href={buildMailto(s)}
                      className="px-3 py-2 text-[10px] font-black uppercase tracking-widest border-2 border-red-600 bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Relancer par mail
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
