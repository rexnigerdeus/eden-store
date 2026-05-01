import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import InfiniteProductList from '@/components/InfiniteProductList'

// Fonction utilitaire pour le design Bento
const getBentoClass = (index: number) => {
  const classes = [
    "col-span-1 sm:col-span-2 md:row-span-2 min-h-[200px] md:min-h-[300px]", // 1. Grand carré principal (Habillement)
    "col-span-1 sm:col-span-1 md:row-span-1 min-h-[150px]", // 2. Petit carré (Accessoires)
    "col-span-1 sm:col-span-1 md:row-span-1 min-h-[150px]", // 3. Petit carré (Artisanat)
    "col-span-1 sm:col-span-2 md:row-span-1 min-h-[150px]", // 4. Rectangle horizontal (Cosmétiques)
    "col-span-1 sm:col-span-1 md:row-span-1 min-h-[150px]", // 5. Petit carré (Linge)
    "col-span-1 sm:col-span-1 md:row-span-1 min-h-[150px]", // 6. Petit carré (Livres)
  ]
  return classes[index % classes.length]
}

// Dictionnaire d'images thématiques basées sur les noms de catégories
const getCategoryImageUrl = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('habillement') || name.includes('vêtement') || name.includes('mode')) {
    return "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop"; 
  }
  if (name.includes('accessoire') || name.includes('bijou') || name.includes('sac')) {
    return "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop"; 
  }
  if (name.includes('artisanat') || name.includes('art')) {
    return "https://images.unsplash.com/photo-1610715936287-6c2ab208cb22?q=80&w=800&auto=format&fit=crop"; 
  }
  if (name.includes('cosmétique') || name.includes('beauté') || name.includes('soin')) {
    return "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop"; 
  }
  if (name.includes('linge') || name.includes('maison') || name.includes('déco')) {
    return "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop"; 
  }
  if (name.includes('livre') || name.includes('culture')) {
    return "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop"; 
  }
  if (name.includes('électronique') || name.includes('smartphone') || name.includes('gadget')) {
    return "https://images.unsplash.com/photo-1537498425277-c283d32ef9db?q=80&w=2078&auto=format&fit=crop"; 
  }
  
  // Image par défaut si la catégorie n'est pas reconnue
  return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop"; 
}

export default async function MarketplacePage() {
  const supabase = await createClient()

  // 1. Récupérer les catégories
  const { data: categories } = await supabase.from('categories').select('*').limit(6)

  // 2. Récupérer les boutiques actives
  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, slug, logo_url')
    .eq('subscription_status', 'active')
    .limit(8)

  // On récupère uniquement la PREMIÈRE page (les 8 premiers produits) en serveur
  // Le composant client se chargera de la suite !
  const { data: initialProducts } = await supabase
    .from('products')
    .select('*, shops!inner(name, slug)')
    .eq('is_available', true)
    .eq('shops.subscription_status', 'active')
    .order('created_at', { ascending: false })
    .range(0, 7) // Index 0 à 7 = 8 produits

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-12 md:space-y-16">
        
        {/* --- SECTION : CATÉGORIES BENTO --- */}
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Univers & Catégories</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {categories?.map((category, index) => (
              <Link 
                key={category.id} 
                href={`/category/${category.id}`} 
                className={`group relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${getBentoClass(index)}`}
              >
                {/* Image thématique générée par la fonction utilitaire */}
                <img 
                  src={getCategoryImageUrl(category.name)} 
                  alt={category.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay dégradé pour lire le texte */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Nom de la catégorie */}
                <div className="absolute bottom-0 left-0 p-4 md:p-6">
                  <h3 className="text-white font-bold text-lg md:text-2xl tracking-wide">
                    {category.name}
                  </h3>
                  <div className="w-8 h-1 bg-walmart-blue mt-2 rounded-full transform origin-left group-hover:scale-x-150 transition-transform"></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- SECTION : EXPLORER LES BOUTIQUES --- */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 md:mb-6 gap-2 sm:gap-0">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Nos Boutiques Partenaires</h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">Découvrez les créateurs et vendeurs de la plateforme.</p>
            </div>
            <Link href="/shops" className="text-sm md:text-base text-walmart-blue font-medium hover:underline flex items-center gap-1 self-start sm:self-auto">
              Voir tout <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {shops?.map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.slug}`} className="group flex flex-col items-center gap-2 md:gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center group-hover:border-walmart-blue group-hover:shadow-md transition-all">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl md:text-2xl font-bold text-gray-400 group-hover:text-walmart-blue transition-colors">
                      {shop.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-900 text-center line-clamp-1 group-hover:text-walmart-blue">
                  {shop.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* --- SECTION : TOUS LES PRODUITS (INFINITE LOADING) --- */}
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Découvrez notre catalogue</h2>
          </div>
          
          {/* On remplace la grille statique par notre composant intelligent */}
          <InfiniteProductList initialProducts={initialProducts || []} />
          
        </section>

      </main>
    </div>
  )
}
