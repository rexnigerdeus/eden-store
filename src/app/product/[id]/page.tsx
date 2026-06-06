import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ProductActions from './ProductActions'
import FavoriteButton from '@/components/FavoriteButton'
import ReviewSection from '@/components/ReviewSection'

export default async function ProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params
  const productId = resolvedParams.id

  const { data: product, error } = await supabase.from('products').select('*, shops(*)').eq('id', productId).single()
  if (error || !product) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  let isFavorite = false
  if (user) {
    const { data: fav } = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('product_id', product.id).single()
    if (fav) isFavorite = true
  }

  const shop = product.shops

  const { data: reviews } = await supabase.from('reviews').select('id, rating, comment, created_at, profiles(full_name)').eq('product_id', product.id).order('created_at', { ascending: false })

  let canReview = false
  if (user) {
    const { data: hasBought } = await supabase.from('orders').select('id, order_items!inner(product_id)').eq('customer_id', user.id).eq('order_items.product_id', product.id).limit(1)
    if (hasBought && hasBought.length > 0) {
      const { data: checkReview } = await supabase.from('reviews').select('id').eq('user_id', user.id).eq('product_id', product.id).single()
      if (!checkReview) canReview = true
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row">
        
        {/* COLONNE GAUCHE : L'IMAGE (Format Carré pour le généraliste) */}
        <div className="w-full md:w-[55%] bg-gray-50 relative flex items-center justify-center border-r border-gray-100">
          {product.cover_image_url ? (
            <div className="w-full aspect-square md:sticky md:top-20">
              <img 
                src={product.cover_image_url} 
                alt={product.title} 
                className="w-full h-full object-contain p-4 md:p-12"
              />
            </div>
          ) : (
            <div className="w-full aspect-square flex items-center justify-center text-gray-300 font-bold uppercase text-xl">
              Image non disponible
            </div>
          )}
        </div>

        {/* COLONNE DROITE : INFOS & ACTIONS */}
        <div className="w-full md:w-[45%] px-4 py-8 md:p-10 lg:p-14">
          
          <nav className="text-[10px] text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
            <Link href="/" className="hover:text-black">Accueil</Link> / 
            <Link href={`/shop/${shop.slug}`} className="hover:text-black">{shop.name}</Link>
          </nav>

          <div className="flex justify-between items-start gap-4 mb-3">
            <h1 className="text-2xl md:text-3xl font-bold text-black leading-tight">
              {product.title}
            </h1>
            <div className="mt-1">
              <FavoriteButton productId={product.id} initialIsFavorite={isFavorite} isLoggedIn={!!user} />
            </div>
          </div>

          <div className="text-3xl font-bold text-red-600 mb-6">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(product.price)}
          </div>

          {/* SÉLECTEUR ET BOUTONS */}
          <ProductActions product={product} />

          {/* ACCORDÉONS D'INFORMATIONS */}
          <div className="border-t border-gray-200 mt-8">
            
            <details className="group border-b border-gray-200" open>
              <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-5 text-sm uppercase tracking-wider text-black">
                Description
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-sm text-gray-600 pb-6 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </div>
            </details>

            <details className="group border-b border-gray-200">
              <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-5 text-sm uppercase tracking-wider text-black">
                À propos du vendeur
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-sm text-gray-600 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  {shop?.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-12 h-12 object-cover border border-gray-100" />
                  ) : (
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold">
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <Link href={`/shop/${shop.slug}`} className="font-bold text-black uppercase hover:underline">
                    {shop.name}
                  </Link>
                </div>
                {shop.delivery_locations && <p className="mb-2"><strong>📍 Livraison :</strong> {shop.delivery_locations}</p>}
                {shop.return_policy && <p><strong>🛡️ Retours :</strong> {shop.return_policy}</p>}
              </div>
            </details>

            <details className="group border-b border-gray-200">
              <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-5 text-sm uppercase tracking-wider text-black">
                Avis Clients ({reviews?.length || 0})
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="pb-6">
                <ReviewSection productId={product.id} shopId={shop.id} canReview={canReview} reviews={reviews || []} />
              </div>
            </details>

          </div>
        </div>
      </main>
    </div>
  )
}