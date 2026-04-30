import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }> // NOUVEAU: On attend potentiellement un paramètre "category"
}) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || '' 
  const categorySlug = resolvedParams.category || ''
  
  const supabase = await createClient()

  // 1. Si on a cliqué sur une catégorie, on va chercher son ID et son vrai nom
  let categoryId = null
  let categoryName = ''
  
  if (categorySlug) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', categorySlug)
      .single()
      
    if (categoryData) {
      categoryId = categoryData.id
      categoryName = categoryData.name
    }
  }

  // 2. On prépare la requête des produits
  let dbQuery = supabase
    .from('products')
    .select('*, shops!inner(name, slug)')
    .eq('is_available', true)

  // 3. On applique les filtres
  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`)
  }
  
  // Si on est dans une catégorie, on filtre par l'ID de la catégorie !
  if (categoryId) {
    dbQuery = dbQuery.eq('category_id', categoryId)
  }

  const { data: products } = await dbQuery.order('created_at', { ascending: false })

  // Titre dynamique de la page
  let pageTitle = 'Tous les produits'
  if (query && categoryName) {
    pageTitle = `Résultats pour "${query}" dans ${categoryName}`
  } else if (query) {
    pageTitle = `Résultats pour "${query}"`
  } else if (categoryName) {
    pageTitle = `Catégorie : ${categoryName}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-8 border-b border-gray-200 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-500 mt-2">{products?.length || 0} article(s) trouvé(s)</p>
          </div>
          
          {/* Bouton pour réinitialiser les filtres si on est dans une catégorie */}
          {(query || categorySlug) && (
            <Link href="/search" className="text-sm font-medium text-walmart-blue hover:underline bg-blue-50 px-4 py-2 rounded-lg">
              Voir tout le catalogue
            </Link>
          )}
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                  {product.cover_image_url ? (
                    <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-5xl">📷</span></div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-gray-900 font-medium line-clamp-1 group-hover:text-walmart-blue transition-colors">{product.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">Vendu par {product.shops?.name}</p>
                  <div className="mt-auto pt-3">
                    <span className="text-lg font-bold text-walmart-darkBlue">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-gray-500">Il n'y a pas encore de produits dans cette catégorie.</p>
            <Link href="/" className="inline-block mt-6 px-6 py-2 bg-walmart-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}