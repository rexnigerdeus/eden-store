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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        
        {/* En-tête de la page */}
        <div className="mb-6 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">{category.name}</h1>
          <p className="text-sm sm:text-base text-gray-500">
            {products?.length || 0} article(s) disponible(s) dans cette catégorie
          </p>
        </div>

        {/* Grille de produits */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                  {product.cover_image_url ? (
                    <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl sm:text-3xl">📷</div>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1 line-clamp-1">{product.shops?.name}</p>
                  <h3 className="text-sm sm:text-base text-gray-900 font-medium line-clamp-2 leading-tight group-hover:text-walmart-blue transition-colors">{product.title}</h3>
                  <div className="mt-auto pt-2 sm:pt-3">
                    <span className="text-base sm:text-lg font-bold text-walmart-darkBlue">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl border border-gray-200 px-4">
            <span className="text-5xl sm:text-6xl block mb-3 sm:mb-4 opacity-30">📦</span>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900">Aucun produit</h3>
            <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Il n'y a pas encore d'articles dans la catégorie {category.name}.</p>
            <Link href="/" className="inline-block mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 bg-walmart-blue text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}