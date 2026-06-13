import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  // Vérifier si le client est aussi un vendeur pour le menu latéral
  const { data: userShop } = await supabase.from('shops').select('id, name').eq('seller_id', user.id).maybeSingle()

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

  const favoriteProducts = favorites?.map(fav => fav.products).filter(p => p !== null) || []

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 py-8 md:py-16">
        
        {/* EN-TÊTE */}
        <div className="mb-10 md:mb-16 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">Mes Favoris</h1>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-bold mt-3">
            Bonjour {profile?.full_name}, voici votre sélection.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* MENU LATÉRAL STRICT */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-50 border-2 border-black sticky top-24 p-4 space-y-2">
              {userShop && (
                <div className="mb-6">
                  <Link href="/seller/dashboard" className="block w-full text-center px-4 py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors border border-black">
                    ⚙️ Espace Vendeur
                  </Link>
                </div>
              )}
              <nav className="flex flex-col space-y-1">
                <Link href="/account" className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
                  Mes commandes
                </Link>
                <Link href="/account/messages" className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
                  Mes messages
                </Link>
                <Link href="/account/favorites" className="px-4 py-3 text-xs font-bold uppercase tracking-widest bg-black text-white transition-colors">
                  Mes favoris
                </Link>
                <Link href="/track" className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-100 transition-colors mt-2">
                  Suivi rapide
                </Link>
              </nav>
              <div className="border-t border-gray-300 my-4"></div>
              <form action="/auth/signout" method="POST">
                <button type="submit" className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors">
                  Déconnexion
                </button>
              </form>
            </div>
          </div>

          {/* GRILLE DES FAVORIS */}
          <div className="flex-1">
            {favoriteProducts.length === 0 ? (
              <div className="bg-gray-50 border-2 border-black p-12 md:p-20 text-center">
                <h3 className="text-xl md:text-2xl font-montserrat font-black text-black uppercase tracking-widest mb-2">Aucun favori</h3>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">Votre sélection est vide pour le moment.</p>
                <Link href="/" className="inline-block px-10 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors border-2 border-black">
                  Explorer le catalogue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {favoriteProducts.map((product: any) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white border-2 border-black">
                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden border-b-2 border-black">
                      {product.cover_image_url ? (
                        <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl font-montserrat font-black uppercase">EDEN MARKET</div>
                      )}
                      
                      {/* Badge Épuisé */}
                      {!product.is_available && (
                        <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-r-2 border-b-2 border-black">
                          Rupture
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-[10px] md:text-xs text-gray-500 mb-1 uppercase tracking-widest font-semibold truncate">
                        {product.shops?.name}
                      </p>
                      <h3 className="text-sm md:text-base text-black font-montserrat font-bold uppercase tracking-wide truncate group-hover:underline">
                        {product.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm md:text-base font-bold text-red-600">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(product.price)}
                        </span>
                        <span className="text-black font-bold uppercase text-xs underline group-hover:no-underline">
                          Voir
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