'use client'

import { useState, useTransition } from 'react'
import { updateCategory } from './actions'

type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
}

export default function EditCategoryModal({
  category,
  onClose,
}: {
  category: Category
  onClose: () => void
}) {
  const [name, setName] = useState(category.name)
  const [slug, setSlug] = useState(category.slug)
  const [icon, setIcon] = useState(category.icon || '')
  const [slugTouched, setSlugTouched] = useState(true) // Pré-rempli, on ne l'auto-dérive plus
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Auto-dérive le slug à partir du nom UNIQUEMENT si l'admin n'a pas modifié le slug manuellement
  // depuis l'ouverture de la modale (et seulement tant qu'il correspond déjà à la dérivation initiale).
  const initialDerivedSlug = category.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  const handleNameChange = (val: string) => {
    setName(val)
    if (!slugTouched || slug === initialDerivedSlug) {
      const next = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(next)
      setSlugTouched(false)
    }
  }

  const handleSlugChange = (val: string) => {
    setSlug(val)
    setSlugTouched(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Le nom est obligatoire.')
      return
    }
    if (!slug.trim()) {
      setError('Le slug est obligatoire.')
      return
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Le slug ne peut contenir que des lettres minuscules, chiffres et tirets.')
      return
    }

    const fd = new FormData()
    fd.append('id', category.id)
    fd.append('name', name.trim())
    fd.append('slug', slug.trim())
    fd.append('icon', icon.trim())

    startTransition(async () => {
      const result = await updateCategory(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white border-2 border-black w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="bg-black text-white p-5 flex items-center justify-between border-b-2 border-black">
          <h2 className="font-montserrat font-black uppercase tracking-widest text-sm">
            Modifier la catégorie
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-red-600 transition-colors text-2xl leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Nom de la rubrique *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="EX: VÊTEMENTS"
              className="w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors rounded-none uppercase tracking-widest"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Slug (URL) *
            </label>
            <div className="flex items-stretch border-2 border-gray-300 focus-within:border-black transition-colors">
              <span className="px-3 flex items-center text-gray-400 font-mono text-sm bg-gray-50 border-r-2 border-gray-300">
                /
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
                placeholder="ex: vetements"
                className="w-full p-4 text-sm font-mono font-bold text-black outline-none bg-white placeholder-gray-400"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
              ⚠️ Modifier le slug peut casser les liens externes pointant vers cette catégorie
              (ex&nbsp;: <code className="bg-gray-100 px-1">/search?category=ancien-slug</code>).
            </p>
          </div>

          {/* Icône */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Icône (Emoji)
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={4}
              placeholder="👕"
              className="w-full p-4 text-sm text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors rounded-none text-2xl text-center"
            />
            <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
              <span className="text-xs uppercase tracking-widest text-gray-500">Aperçu :</span>
              <span className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-2xl">
                {icon || '📁'}
              </span>
              <span className="font-montserrat font-black uppercase tracking-wider text-sm">
                {name || 'Nom catégorie'}
              </span>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-600 text-red-700 text-xs font-bold uppercase tracking-wide">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-4 bg-white text-black font-montserrat font-black uppercase tracking-widest text-sm border-2 border-black hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-4 bg-red-600 text-white font-montserrat font-black uppercase tracking-widest text-sm border-2 border-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Mise à jour…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
