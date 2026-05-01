import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function AllShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  const searchQuery = resolvedParams.q || ''

  // Préparation de la requête
  let query = supabase
    .from('shops')
    .select('id, name, slug, logo_url, expertise, delivery_locations')
    .order('name', { ascending: true })

  // Si l'utilisateur a tapé une recherche, on filtre (insensible à la casse)
  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`)
  }

  const { data: shops } = await query

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* En-tête de la page */}
      <div className="bg-white border-b border-gray-200 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Explorez nos Boutiques</h1>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Découvrez l'univers de nos vendeurs partenaires et trouvez les meilleurs produits près de chez vous.
          </p>

          {/* BARRE DE RECHERCHE DÉDIÉE BOUTIQUES */}
          <form action="/shops" method="GET" className="mt-6 sm:mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                🔍
              </span>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Rechercher une boutique par son nom..."
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue outline-none transition-all shadow-sm"
              />
            </div>
            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-walmart-blue text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Rechercher
            </button>
          </form>
          
          {searchQuery && (
             <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
               Résultats pour "<span className="font-semibold text-gray-900">{searchQuery}</span>" ({shops?.length || 0})
             </p>
          )}
        </div>
      </div>

      {/* Grille des résultats */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {shops && shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.slug}`} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
                
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-50 bg-gray-100 overflow-hidden mb-3 sm:mb-4 group-hover:border-blue-50 transition-colors flex-shrink-0">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-walmart-blue to-walmart-darkBlue flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-walmart-blue transition-colors">{shop.name}</h3>
                
                {shop.expertise && (
                  <p className="text-xs sm:text-sm text-walmart-blue font-medium mt-1 line-clamp-1">{shop.expertise}</p>
                )}
                
                {shop.delivery_locations && (
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-2 sm:mt-3 flex items-center justify-center gap-1">
                    <span>📍</span> <span className="line-clamp-1">{shop.delivery_locations}</span>
                  </p>
                )}
                
                <div className="mt-4 sm:mt-6 w-full py-2 bg-gray-50 text-gray-700 text-xs sm:text-sm font-medium rounded-lg group-hover:bg-walmart-blue group-hover:text-white transition-colors">
                  Visiter la vitrine
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <span className="text-5xl sm:text-6xl block mb-3 sm:mb-4 opacity-30">🏪</span>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900">Aucune boutique trouvée</h3>
            <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Essayez de modifier votre recherche.</p>
            {searchQuery && (
              <Link href="/shops" className="inline-block mt-3 sm:mt-4 text-sm sm:text-base text-walmart-blue hover:underline font-medium">
                Afficher toutes les boutiques
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}