'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { dismissSellerReminder, getSellerReminderState } from '@/app/actions/supportActions'

// ============================================================================
// Modal "Configurez votre boutique" — affichée pour les vendeurs sans boutique
// si l'admin a activé le toggle global.
// ============================================================================

export default function SellerReminderModal() {
  const pathname = usePathname() || ''
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [isPending, startTransition] = useTransition()

  // On masque le popup sur les pages où il n'a pas de sens
  const isExcluded =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/seller/dashboard') || // le dashboard vendeur gère déjà son propre onboarding
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup')

  useEffect(() => {
    if (isExcluded) return

    let mounted = true
    // Petit délai pour ne pas "flasher" tout de suite à l'arrivée
    const t = setTimeout(async () => {
      const { show } = await getSellerReminderState()
      if (!mounted) return
      if (show) setVisible(true)
    }, 1500)

    return () => {
      mounted = false
      clearTimeout(t)
    }
  }, [isExcluded, pathname])

  if (isExcluded || !visible) return null

  function handleDismiss() {
    setVisible(false)
    startTransition(async () => {
      await dismissSellerReminder()
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-reminder-title"
    >
      <div className="bg-white border-2 border-black w-full max-w-md">
        <div className="bg-red-600 text-white p-5 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-red-600 flex items-center justify-center font-black text-xl border-2 border-white">!</div>
            <h2 id="seller-reminder-title" className="font-montserrat font-black uppercase tracking-widest text-sm">
              Finalisez votre boutique
            </h2>
          </div>
          <button
            onClick={handleDismiss}
            disabled={isPending}
            aria-label="Fermer"
            className="text-white hover:text-black transition-colors text-2xl leading-none"
          >×</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center">
            <div className="text-5xl mb-3">🏪</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Votre compte vendeur est créé, mais votre boutique n'est pas encore configurée.
              Lancez-vous maintenant pour profiter de <strong className="text-red-600">14 jours offerts</strong>.
            </p>
          </div>

          <ul className="space-y-2 text-xs font-bold uppercase tracking-widest text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Vitrine publique personnalisée</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Mise en avant de vos produits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Messagerie clients intégrée</span>
            </li>
          </ul>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isPending}
              className="flex-1 py-3 bg-white text-black font-montserrat font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Plus tard
            </button>
            <Link
              href="/seller/dashboard/settings"
              onClick={() => setVisible(false)}
              className="flex-1 py-3 bg-red-600 text-white font-montserrat font-black uppercase tracking-widest text-xs border-2 border-red-600 hover:bg-red-700 transition-colors text-center"
            >
              Configurer ma boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
