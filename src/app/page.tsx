import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// Fonction utilitaire pour le design Bento
const getBentoClass = (index: number) => {
  const classes = [
    "md:col-span-2 md:row-span-2 min-h-[300px]", // 1. Grand carré principal (Habillement)
    "md:col-span-1 md:row-span-1 min-h-[150px]", // 2. Petit carré (Accessoires)
    "md:col-span-1 md:row-span-1 min-h-[150px]", // 3. Petit carré (Artisanat)
    "md:col-span-2 md:row-span-1 min-h-[150px]", // 4. Rectangle horizontal (Cosmétiques)
    "md:col-span-1 md:row-span-1 min-h-[150px]", // 5. Petit carré (Linge)
    "md:col-span-1 md:row-span-1 min-h-[150px]", // 6. Petit carré (Livres)
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

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Récupérer les catégories
  const { data: categories } = await supabase.from('categories').select('*').limit(6)

  // 2. Récupérer les boutiques actives
  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, slug, logo_url')
    .limit(8)

  // 3. Récupérer les produits récents
  const { data: latestProducts } = await supabase
    .from('products')
    .select('*, shops(name, slug)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        {/* --- SECTION : CATÉGORIES BENTO --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Univers & Catégories</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {categories?.map((category, index) => (
              <Link 
                key={category.id} 
                href={`/category/${category.id}`} 
                className={`group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${getBentoClass(index)}`}
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
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white font-bold text-xl md:text-2xl tracking-wide">
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
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Nos Boutiques Partenaires</h2>
              <p className="text-gray-500 mt-1">Découvrez les créateurs et vendeurs de la plateforme.</p>
            </div>
            <Link href="/shops" className="text-walmart-blue font-medium hover:underline flex items-center gap-1">
              Voir tout <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {shops?.map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.slug}`} className="group flex flex-col items-center gap-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center group-hover:border-walmart-blue group-hover:shadow-md transition-all">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-400 group-hover:text-walmart-blue transition-colors">
                      {shop.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 text-center line-clamp-1 group-hover:text-walmart-blue">
                  {shop.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* --- SECTION : PRODUITS RÉCENTS --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Nouveautés</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {latestProducts?.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                  {product.cover_image_url ? (
                    <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">📷</div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-gray-500 mb-1 line-clamp-1">{product.shops?.name}</p>
                  <h3 className="text-gray-900 font-medium line-clamp-2 leading-tight group-hover:text-walmart-blue transition-colors">{product.title}</h3>
                  <div className="mt-auto pt-3">
                    <span className="text-lg font-bold text-walmart-darkBlue">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}