'use client'

import { useState } from 'react'
import EditCategoryModal from './EditCategoryModal'

type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
}

/**
 * Petit wrapper client : gère uniquement l'ouverture/fermeture du modal
 * pour une catégorie donnée. La liste elle-même reste rendue côté serveur
 * (voir page.tsx) — c'est juste qu'on a besoin d'un state React pour
 * piloter l'affichage du modal.
 */
export default function CategoryRowActions({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
        title="Modifier la catégorie"
      >
        Modifier
      </button>

      {open && (
        <EditCategoryModal category={category} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
