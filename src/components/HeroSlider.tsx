'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

export interface HeroSlide {
  /** Identifiant unique (utilisé en key) */
  id: string
  /** URL de l'image de fond (paysage) */
  image: string
  /** Petit sur-titre affiché au-dessus du titre */
  eyebrow: string
  /** Titre principal (gros, en majuscules) */
  title: string
  /** Sous-titre / description courte */
  subtitle: string
  /** Texte du bouton d'action */
  ctaLabel: string
  /** Lien vers lequel le bouton redirige (ex: /category/xxx) */
  ctaHref: string
  /** Position du focus visuel de l'image (utile pour le cadrage) */
  focal?: 'center' | 'top' | 'bottom' | 'left' | 'right'
}

interface HeroSliderProps {
  slides: HeroSlide[]
  /** Délai d'auto-rotation en ms (0 pour désactiver) */
  autoPlayDelay?: number
}

const focalMap: Record<NonNullable<HeroSlide['focal']>, string> = {
  center: 'center',
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
}

export default function HeroSlider({ slides, autoPlayDelay = 6000 }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  // Rotation automatique
  useEffect(() => {
    if (paused || autoPlayDelay <= 0 || slides.length <= 1) return
    const id = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, autoPlayDelay)
    return () => clearTimeout(id)
  }, [current, paused, slides.length, autoPlayDelay])

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length)
  }, [slides.length])

  const goPrev = useCallback(() => goTo(current - 1), [goTo, current])
  const goNext = useCallback(() => goTo(current + 1), [goTo, current])

  if (slides.length === 0) return null

  return (
    <section
      className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-black group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrousel"
      aria-label="Bannière principale"
    >
      {/* SLIDES (empilés, opacity contrôlée) */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => {
          const isActive = index === current
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover opacity-70"
                style={{ objectPosition: focalMap[slide.focal || 'center'] }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          )
        })}
      </div>

      {/* CONTENU (texte + bouton) : suit la slide active */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {slides.map((slide, index) => {
          const isActive = index === current
          return (
            <div
              key={`content-${slide.id}`}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden={!isActive}
            >
              <div className="relative text-center px-4 flex flex-col items-center mt-16 pointer-events-auto">
                <p className="text-white text-xs sm:text-sm md:text-base uppercase tracking-[0.4em] font-bold mb-3 md:mb-5 bg-black/60 px-3 py-1.5">
                  {slide.eyebrow}
                </p>
                <h2 className="text-white font-montserrat font-black uppercase tracking-tighter mb-2 md:mb-4 drop-shadow-lg
                               text-xl sm:text-2xl md:text-4xl lg:text-4xl xl:text-6xl">
                  {slide.title}
                </h2>
                <p className="text-white text-sm md:text-base uppercase tracking-[0.3em] font-bold mb-6 md:mb-10 bg-black/50 px-4 py-1 max-w-2xl">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.ctaHref}
                  className="inline-block bg-white text-black px-8 py-4 md:px-12 md:py-4 font-montserrat font-black text-sm md:text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 border-2 border-white"
                >
                  {slide.ctaLabel}
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* FLÈCHES DE NAVIGATION (Desktop) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/40 hover:bg-black/70 text-white items-center justify-center border-2 border-white transition-colors"
            aria-label="Slide précédente"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/40 hover:bg-black/70 text-white items-center justify-center border-2 border-white transition-colors"
            aria-label="Slide suivante"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* INDICATEURS (dots) */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 md:bottom-10 left-0 right-0 z-30 flex justify-center gap-2 md:gap-3">
          {slides.map((slide, index) => {
            const isActive = index === current
            return (
              <button
                key={`dot-${slide.id}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Aller à la slide ${index + 1}`}
                className={`h-2 transition-all duration-300 border border-white ${
                  isActive ? 'w-10 md:w-14 bg-white' : 'w-2 md:w-3 bg-transparent'
                }`}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
