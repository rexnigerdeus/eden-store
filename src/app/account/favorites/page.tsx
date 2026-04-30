import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Récupérer le profil pour le message d'accueil
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  // 2. Récupérer les favoris avec les infos des produits et des boutiques
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      product_id,
      products (
        id, 
        title, 
        price, 
        cover_image_url, 
        is_available,
        shops (name, slug)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 3. Extraire proprement les produits de l'objet favoris
  const favoriteProducts = favorites?.map(fav => fav.products).filter(p => p !== null) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-walmart-darkBlue">Mes Favoris ❤️</h1>
          <p className="text-gray-500 mt-2">Bonjour {profile?.full_name}, voici les articles que vous avez mis de côté.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Menu latéral Client */}
          <div className="md:col-span-1 space-y-2">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
              <Link href="/account" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                Mes commandes
              </Link>
              <Link href="/account/messages" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                Mes messages
              </Link>
              <Link href="/account/favorites" className="block px-4 py-2 bg-blue-50 text-walmart-blue font-medium rounded-lg">
                Mes favoris
              </Link>
              <Link href="/track" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors">
                Suivi rapide (Invité)
              </Link>
            </div>
          </div>

          {/* Grille des produits favoris */}
          <div className="md:col-span-3">
            {favoriteProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <span className="text-5xl mb-4 block">💔</span>
                <h3 className="text-xl font-medium text-gray-900">Aucun favori pour le moment</h3>
                <p className="text-gray-500 mt-2">Explorez nos boutiques et cliquez sur le cœur pour mettre des articles de côté !</p>
                <Link href="/" className="inline-block mt-6 px-6 py-2 bg-walmart-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Explorer la boutique
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProducts.map((product: any) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                      {product.cover_image_url ? (
                        <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">📷</div>
                      )}
                      
                      {/* Petit badge si le produit n'est plus disponible */}
                      {!product.is_available && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                          Épuisé
                        </div>
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
            )}
          </div>

        </div>
      </main>
    </div>
  )
}