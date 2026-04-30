import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ProductActions from './ProductActions'
import FavoriteButton from '@/components/FavoriteButton'
import ReviewSection from '@/components/ReviewSection'
import SubscribeButton from '@/components/SubscribeButton'

export default async function ProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params
  const productId = resolvedParams.id

  // On récupère le produit ET les informations de la boutique associée en une seule requête
  const { data: product, error } = await supabase
    .from('products')
    .select('*, shops(*)')
    .eq('id', productId)
    .single()

  // Si le produit n'existe pas, on affiche une page 404
  if (error || !product) {
    notFound()
  }

  // On récupère l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()

  // On vérifie s'il l'a mis en favori
  let isFavorite = false
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single()
    
    if (fav) isFavorite = true
  }

  // On vérifie s'il est abonné à la boutique
  let isSubscribed = false
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('shop_id', product.shops?.id)
      .single()
    
    if (sub) isSubscribed = true
  }

  const shop = product.shops

  // --- LOGIQUE DES AVIS ---
  // 1. Récupérer tous les avis de ce produit (avec le nom de l'auteur)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, profiles(full_name)')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })

  // 2. Vérifier si l'utilisateur peut laisser un avis
  let canReview = false
  if (user) {
    // Vérifier s'il l'a acheté
    const { data: hasBought } = await supabase
      .from('orders')
      .select('id, order_items!inner(product_id)')
      .eq('customer_id', user.id)
      .eq('order_items.product_id', product.id)
      .limit(1)
    
    // S'il l'a acheté, vérifier s'il n'a pas DÉJÀ laissé un avis
    if (hasBought && hasBought.length > 0) {
      // On vérifie de manière 100% fiable avec l'ID utilisateur
      const { data: checkReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single()
        
      if (!checkReview) canReview = true
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Fil d'ariane (Breadcrumb) */}
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-walmart-blue">Accueil</Link>
          <span className="mx-2">&gt;</span>
          <Link href={`/shop/${shop.slug}`} className="hover:text-walmart-blue">{shop.name}</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* Colonne de gauche : Image */}
            <div className="bg-gray-100 aspect-square md:aspect-auto relative flex items-center justify-center border-r border-gray-100">
              {product.cover_image_url ? (
                <img 
                  src={product.cover_image_url} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">📷</span>
              )}
            </div>

            {/* Colonne de droite : Informations */}
            <div className="p-8 md:p-12 flex flex-col">
              
              {/* En-tête : Titre + Bouton Favori alignés */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.title}
                </h1>

                {/* NOTRE BOUTON ❤️ (poussé à droite, taille fixe pour ne pas s'écraser) */}
                <div className="flex-shrink-0 mt-1">
                  <FavoriteButton 
                    productId={product.id} 
                    initialIsFavorite={isFavorite} 
                    isLoggedIn={!!user} 
                  />
                </div>
              </div>
              
              <div className="text-3xl font-bold text-walmart-blue mb-8">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.price)}
              </div>

              <div className="prose prose-sm text-gray-700 mb-10 flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>

              {/* On passe toutes les données du produit au composant */}
              <ProductActions product={product} />
              
              <p className="text-center text-sm text-gray-500 mt-3">
                🔒 Paiement sécurisé à la livraison
              </p>

              {/* Carte de la Boutique */}
              <div className="mt-10 p-6 bg-walmart-light rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {shop?.logo_url ? (
                      <img src={shop.logo_url} alt={shop.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-walmart-blue text-white flex items-center justify-center font-bold text-lg">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Vendu par</p>
                      <Link href={`/shop/${shop.slug}`} className="text-lg font-semibold text-walmart-darkBlue hover:underline">
                        {shop.name}
                      </Link>
                    </div>
                  </div>
                  {/* LES BOUTONS D'ACTION (S'abonner & Voir la boutique) */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <SubscribeButton 
                        shopId={shop.id} 
                        initialIsSubscribed={isSubscribed} 
                        isLoggedIn={!!user} 
                      />
                      <Link href={`/shop/${shop.slug}`} className="px-4 py-2 bg-white text-walmart-blue text-sm font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-center flex-1 sm:flex-none">
                        Visiter
                      </Link>
                    </div>
                </div>
                
                {/* Informations de confiance */}
                {(shop.delivery_locations || shop.return_policy) && (
                  <div className="mt-4 pt-4 border-t border-blue-200/50 space-y-2 text-sm text-gray-700">
                    {shop.delivery_locations && (
                      <p><span className="font-medium text-gray-900">📍 Livraison :</span> {shop.delivery_locations}</p>
                    )}
                    {shop.return_policy && (
                      <p><span className="font-medium text-gray-900">🛡️ Retours :</span> {shop.return_policy}</p>
                    )}
                  </div>
                )}
              </div>

              {/* NOUVELLE SECTION AVIS EN BAS DE PAGE */}
              <ReviewSection 
                productId={product.id} 
                shopId={shop.id} 
                canReview={canReview} 
                reviews={reviews || []} 
              />

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}