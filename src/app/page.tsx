import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import InfiniteProductList from '@/components/InfiniteProductList'

// Fonction pour attribuer des images très "Streetwear/Fashion" aux catégories
const getCategoryImageUrl = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('habillement') || name.includes('vêtement') || name.includes('t-shirt')) {
    return "https://images.unsplash.com/photo-1523398002811-999aa8e9face?q=80&w=800&auto=format&fit=crop"; 
  }
  if (name.includes('accessoire') || name.includes('casquette')) {
    return "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"; 
  }
  if (name.includes('chaussure') || name.includes('sneaker')) {
    return "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop"; 
  }
  // Image par défaut (Look urbain)
  return "https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?q=80&w=800&auto=format&fit=crop"; 
}

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Récupérer quelques catégories pour la mise en avant
  const { data: categories } = await supabase.from('categories').select('*').limit(4)

  // 2. Récupérer les 8 premiers produits pour le défilement infini
  const { data: initialProducts } = await supabase
    .from('products')
    .select('*, shops!inner(name, slug)')
    .eq('is_available', true)
    .eq('shops.subscription_status', 'active')
    .order('created_at', { ascending: false })
    .range(0, 7)

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* --- HERO BANNER (Plein écran, très impactant) --- */}
      <section className="relative w-full h-[70vh] md:h-[85vh] flex items-center justify-center bg-black">
        {/* L'image de fond principale */}
        <img 
          src="https://images.unsplash.com/photo-1606856086780-321abfb481cd?q=80&w=2000&auto=format&fit=crop" 
          alt="Streetwear Collection" 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        
        <div className="relative z-10 text-center px-4 flex flex-col items-center mt-16">
          <h2 className="text-white font-montserrat font-black text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter mb-2 md:mb-4 drop-shadow-lg">
            Saison <br className="md:hidden" /> 1.
          </h2>
          <p className="text-white text-sm md:text-xl uppercase tracking-[0.3em] font-bold mb-8 md:mb-10 bg-black/50 px-4 py-1">
            La nouvelle collection est là
          </p>
          <Link href="#nouveautes" className="inline-block bg-white text-black px-8 py-4 md:px-12 md:py-4 font-montserrat font-black text-sm md:text-base uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300">
            Acheter maintenant
          </Link>
        </div>
      </section>

      {/* --- SHOP BY CATEGORY (Grille brute) --- */}
      <section className="py-12 md:py-20 max-w-[1600px] mx-auto px-4 sm:px-6">
        <h2 className="font-montserrat font-black text-3xl md:text-4xl text-black uppercase tracking-tight mb-8 md:mb-12 text-center">
          Acheter par catégorie
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories?.map((category) => (
            <Link key={category.id} href={`/category/${category.id}`} className="group relative block aspect-[4/5] bg-gray-100 overflow-hidden">
              <img 
                src={getCategoryImageUrl(category.name)} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              {/* Overlay sombre en bas pour le texte */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-6 left-0 w-full text-center">
                <h3 className="text-white font-montserrat font-black text-xl md:text-2xl uppercase tracking-widest">
                  {category.name}
                </h3>
                <span className="inline-block mt-2 text-xs text-white uppercase tracking-widest border-b border-white pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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