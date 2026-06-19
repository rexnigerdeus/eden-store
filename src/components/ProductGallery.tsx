'use client'

import { useState } from 'react'

type MediaKind = 'cover' | 'real' | 'video'

interface MediaItem {
  kind: MediaKind
  url: string
  label: string
  /**
   * Vrai si la vidéo doit être lue automatiquement après changement d'onglet.
   * On met `false` pour ne pas relancer la vidéo à chaque clic de thumbnail.
   */
  autoplay?: boolean
}

interface ProductGalleryProps {
  coverImageUrl?: string | null
  realImageUrl?: string | null
  videoUrl?: string | null
  isOutOfStock?: boolean
  productTitle: string
  hasMediaCompliance?: boolean
}

/**
 * Galerie produit avec :
 *  - Une grande fenêtre d'aperçu (image ou vidéo)
 *  - Des thumbnails cliquables en dessous
 *  - Un label contextuel ("Photo de couverture", "Photo réelle", "Vidéo 15 s")
 *  - Optionnel : bandeau de conformité sous la galerie
 *
 * Le composant détermine lui-même la liste des médias à afficher en
 * fonction de ce qui est fourni par le backend.
 */
export default function ProductGallery({
  coverImageUrl,
  realImageUrl,
  videoUrl,
  isOutOfStock = false,
  productTitle,
  hasMediaCompliance = false,
}: ProductGalleryProps) {
  // Construction de la liste ordonnée des médias disponibles.
  // Ordre d'affichage : 1) cover, 2) real, 3) video
  const items: MediaItem[] = []
  if (coverImageUrl) {
    items.push({ kind: 'cover', url: coverImageUrl, label: 'Photo de couverture' })
  }
  if (realImageUrl) {
    items.push({ kind: 'real', url: realImageUrl, label: 'Photo réelle de l\'article' })
  }
  if (videoUrl) {
    items.push({ kind: 'video', url: videoUrl, label: 'Vidéo de démonstration (15 s)' })
  }

  // Si aucun média n'est disponible, on affiche un placeholder
  if (items.length === 0) {
    return (
      <div className="w-full aspect-square flex items-center justify-center text-gray-300 font-bold uppercase text-xl">
        Image non disponible
      </div>
    )
  }

  const [activeIndex, setActiveIndex] = useState(0)
  const active = items[activeIndex] ?? items[0]

  // Petite icône affichée sur le thumbnail vidéo pour la différencier
  // rapidement des photos.
  const videoBadge = (
    <span className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
      <svg className="w-8 h-8 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  )

  return (
    <div className="w-full">

      {/* === FENÊTRE D'APERÇU PRINCIPALE === */}
      <div className="w-full aspect-square relative bg-white border-2 border-black">
        {active.kind === 'video' ? (
          <video
            key={active.url /* re-mount au changement pour réinitialiser la timeline */}
            src={active.url}
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
            className="w-full h-full object-contain bg-black"
            aria-label={`${productTitle} - ${active.label}`}
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        ) : (
          <img
            key={active.url}
            src={active.url}
            alt={`${productTitle} - ${active.label}`}
            className={`w-full h-full object-contain p-4 md:p-12 ${
              isOutOfStock ? 'grayscale opacity-80' : ''
            }`}
          />
        )}

        {/* Badge rupture de stock (uniquement sur l'aperçu principal) */}
        {isOutOfStock && active.kind !== 'video' && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black uppercase tracking-widest px-3 py-2 border-2 border-white shadow-md">
            En rupture de stock
          </div>
        )}

        {/* Label contextuel en haut à droite */}
        <div className="absolute top-4 right-4 bg-black/85 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/20 max-w-[70%] text-right">
          {active.label}
        </div>
      </div>

      {/* === THUMBNAILS CLIQUABLES === */}
      {items.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Médias du produit">
          {items.map((item, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={item.kind}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                onClick={() => setActiveIndex(index)}
                className={`relative shrink-0 w-20 h-20 border-2 overflow-hidden bg-white group transition-all ${
                  isActive
                    ? 'border-black ring-2 ring-black ring-offset-1'
                    : 'border-gray-200 hover:border-black'
                }`}
              >
                {item.kind === 'video' ? (
                  <>
                    <video
                      src={item.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    {videoBadge}
                  </>
                ) : (
                  <img
                    src={item.url}
                    alt=""
                    className={`w-full h-full object-cover ${
                      isOutOfStock ? 'grayscale opacity-80' : ''
                    }`}
                  />
                )}

                {/* Petite barre de sélection sous le thumbnail actif */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* === BANDEAU DE CONFORMITÉ === */}
      {hasMediaCompliance && (
        <div className="mt-4 bg-gray-100 border border-gray-200 p-3 text-[11px] font-bold uppercase tracking-widest text-gray-700 flex items-center gap-2">
          <span className="text-green-600 text-base">✓</span>
          Conformité médias garantie par le vendeur
        </div>
      )}
    </div>
  )
}
