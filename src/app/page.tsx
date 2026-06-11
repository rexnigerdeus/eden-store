import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import InfiniteProductList from '@/components/InfiniteProductList'
import HeroSlider, { HeroSlide } from '@/components/HeroSlider'
import { getCategoryImageUrl } from '@/utils/categoryImages'

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Récupérer TOUTES les catégories pour la mise en avant
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  // 2. Récupérer les 8 premiers produits pour le défilement infini
  // (Les produits en rupture sont conservés : ils seront affichés avec un badge)
  const { data: initialProducts } = await supabase
    .from('products')
    .select('*, shops!inner(name, slug)')
    .eq('shops.subscription_status', 'active')
    .order('created_at', { ascending: false })
    .range(0, 7)

  // 3. Construction des 3 slides du Hero à partir des 3 premières catégories.
  // Si la base contient moins de 3 catégories, on complète avec des slides génériques
  // pour garantir un carrousel de 3 entrées et une mise en page stable.
  const FALLBACK_SLIDES: HeroSlide[] = [
    {
      id: 'fallback-mode',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
      eyebrow: 'Saison 1',
      title: 'Saison 1.',
      subtitle: 'La nouvelle collection est là',
      ctaLabel: 'Acheter maintenant',
      ctaHref: '#nouveautes',
    },
  ]

  const dynamicSlides: HeroSlide[] = (categories || []).slice(0, 3).map((cat) => ({
    id: cat.id,
    image: getCategoryImageUrl(cat.name),
    eyebrow: 'Univers',
    title: cat.name,
    subtitle: 'Découvrez notre sélection',
    ctaLabel: 'Voir la collection',
    ctaHref: `/category/${cat.id}`,
  }))

  const slides: HeroSlide[] =
    dynamicSlides.length > 0
      ? dynamicSlides
      : FALLBACK_SLIDES

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* --- HERO BANNER : SLIDER RESPONSIVE 3 SLIDES --- */}
      <HeroSlider slides={slides} autoPlayDelay={7000} />

      {/* --- SHOP BY CATEGORY (Grille brute) --- */}
      <section className="py-12 md:py-20 max-w-[1600px] mx-auto px-4 sm:px-6">
        <h2 className="font-montserrat font-black text-3xl md:text-4xl text-black uppercase tracking-tight mb-8 md:mb-12 text-center">
          Acheter par catégorie
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories?.map((category) => (
            <Link key={category.id} href={`/category/${category.id}`} className="group relative block aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm">
              <img
                src={getCategoryImageUrl(category.name)}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              {/* Overlay sombre permanent pour garantir un contraste optimal */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 group-hover:from-black/80 group-hover:via-black/30 group-hover:to-black/10 transition-all duration-500" aria-hidden="true" />
              {/* Contenu textuel toujours lisible grâce à l'overlay sombre */}
              <div className="absolute inset-x-0 bottom-4 md:bottom-5 px-2 md:px-3 text-center">
                <h3 className="text-white font-montserrat font-black uppercase tracking-tight drop-shadow-md leading-[1.05]
                               text-[11px] sm:text-xs md:text-sm lg:text-base
                               line-clamp-3 break-words">
                  {category.name}
                </h3>
                <span className="inline-block mt-1.5 md:mt-2 text-[9px] md:text-[10px] text-white uppercase tracking-widest border-b border-white pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Découvrir
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- NOUVEAUTÉS (Défilement infini) --- */}
      <section id="nouveautes" className="pb-24 max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <h2 className="font-montserrat font-black text-3xl md:text-4xl text-black uppercase tracking-tight text-center">
            Nouveautés
          </h2>
          <div className="h-1 w-24 bg-red-600 mt-4"></div>
        </div>

        <InfiniteProductList initialProducts={initialProducts || []} />
      </section>

    </div>
  )
}