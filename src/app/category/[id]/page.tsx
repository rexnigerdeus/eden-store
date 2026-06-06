import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default async function CategoryPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const categoryId = resolvedParams.id
  const supabase = await createClient()

  // 1. Récupérer les infos de la catégorie
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (!category) notFound()

  // 2. Récupérer tous les produits dispos dans cette catégorie
  const { data: products } = await supabase
    .from('products')
    .select('*, shops!inner(name, slug)')
    .eq('category_id', category.id)
    .eq('is_available', true)
    .eq('shops.subscription_status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* BANNIÈRE DE TITRE (Style Épuré) */}
      <div className="bg-gray-50 border-b border-gray-200 py-12 md:py-20 text-center px-4">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-montserrat font-black text-black uppercase tracking-tight mb-4">
          {category.name}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-bold">
          {products?.length || 0} Article(s)
        </p>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        
        {products && products.length > 0 ? (
          <>
            {/* BARRE DE FILTRES / TRI (Style Fashion) */}
            <div className="flex justify-between items-center border-b border-black pb-4 mb-8 md:mb-12">
              <button className="text-xs md:text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                <span className="hidden sm:inline">Filtrer</span>
              </button>
              
              <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
                <span className="hidden sm:inline text-gray-500">Trier par :</span>
                <select className="bg-transparent border-none outline-none cursor-pointer focus:ring-0">
                  <option>Nouveautés</option>
                  <option>Prix croissant</option>
                  <option>Prix décroissant</option>
                </select>
              </div>
            </div>

            {/* GRILLE DE PRODUITS (Identique à la Homepage pour la cohérence) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white">
                  
                  {/* L'image (Format 3/4) */}
                  <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden mb-4 border border-gray-100">
                    {product.cover_image_url ? (
                      <img 
                        src={product.cover_image_url} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl font-montserrat font-black uppercase">
                        ASIM
                      </div>
                    )}
                  </div>

                  {/* Les informations */}
                  <div className="flex flex-col">
                    <p className="text-[10px] md:text-xs text-gray-500 mb-1 uppercase tracking-widest font-semibold truncate">
                      {product.shops?.name}
                    </p>
                    <h3 className="text-sm md:text-base text-black font-montserrat font-bold uppercase tracking-wide truncate group-hover:underline">
                      {product.title}
                    </h3>
                    <div className="mt-2">
                      <span className="text-sm md:text-base font-bold text-red-600">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(product.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          /* ÉTAT VIDE (Empty State) - Version Brutaliste */
          <div className="text-center py-20 md:py-32 bg-gray-50 border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-montserrat font-black text-black uppercase tracking-tight mb-4">
              Catégorie vide
            </h3>
            <p className="text-sm md:text-base text-gray-500 uppercase tracking-widest mb-8">
              Il n'y a pas encore d'articles disponibles ici.
            </p>
            <Link href="/" className="inline-block px-10 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}