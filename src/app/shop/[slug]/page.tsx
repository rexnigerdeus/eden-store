import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SubscribeButton from '@/components/SubscribeButton'

export default async function ShopPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params
  const shopSlug = resolvedParams.slug

  // 1. Récupérer les infos de la boutique
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', shopSlug)
    .single()

  if (shopError || !shop) {
    notFound()
  }

  // 2. Récupérer les produits en ligne de cette boutique
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  // 3. Variables pour vérifier si le vendeur a rempli les sections optionnelles
  const hasAboutSection = shop.story || shop.bio || shop.values
  const hasPoliciesSection = shop.delivery_locations || shop.return_policy || shop.policies

  // 4. Vérifier si l'utilisateur est abonné
  const { data: { user } } = await supabase.auth.getUser()
  let isSubscribed = false
  if (user && shop) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('shop_id', shop.id)
      .single()
    isSubscribed = !!sub
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pb-20">
        
        {/* --- 1. L'EN-TÊTE (HERO SECTION) --- */}
        <div className="bg-white border-b border-gray-200">
          
          {/* Bannière */}
          <div className="h-32 sm:h-48 md:h-72 bg-walmart-light relative overflow-hidden">
            {shop.banner_url ? (
              <img src={shop.banner_url} alt="Bannière" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <span className="text-4xl sm:text-6xl opacity-20">🏪</span>
              </div>
            )}
            {/* Overlay sombre léger pour faire ressortir le logo si la bannière est claire */}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Informations de la boutique */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-12 sm:-mt-16 md:-mt-24 pb-6 sm:pb-8 flex flex-col items-center sm:items-end sm:flex-row sm:gap-6 md:gap-8">
              
              {/* Logo */}
              <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg flex-shrink-0 z-10">
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-walmart-blue to-walmart-darkBlue flex items-center justify-center text-white text-3xl sm:text-5xl md:text-6xl font-bold">
                    {shop.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Textes et réseaux sociaux */}
              <div className="mt-4 sm:mt-0 flex-1 text-center sm:text-left pt-2 sm:pt-16 md:pt-24">
                <div className="mt-3 sm:mt-5 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{shop.name}</h1>
                  <SubscribeButton 
                    shopId={shop.id} 
                    initialIsSubscribed={isSubscribed} 
                    isLoggedIn={!!user} 
                  />
                </div>
                
                
                {/* Le slogan / Expertise */}
                {shop.expertise && (
                  <p className="text-base sm:text-lg font-medium text-walmart-blue mt-2 sm:mt-1">{shop.expertise}</p>
                )}
                
                {shop.description && (
                  <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3 max-w-2xl leading-relaxed px-4 sm:px-0">{shop.description}</p>
                )}
                
                {/* Réseaux Sociaux */}
                <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
                  {shop.instagram && (
                    <a href={shop.instagram} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-gray-500 hover:text-pink-600 font-medium transition-colors flex items-center gap-2">
                      <span>📸</span> Instagram
                    </a>
                  )}
                  {shop.facebook && (
                    <a href={shop.facebook} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-gray-500 hover:text-blue-600 font-medium transition-colors flex items-center gap-2">
                      <span>📘</span> Facebook
                    </a>
                  )}
                  {shop.tiktok && (
                    <a href={shop.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-gray-500 hover:text-black font-medium transition-colors flex items-center gap-2">
                      <span>🎵</span> TikTok
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* --- COLONNE DE GAUCHE : L'UNIVERS DE LA BOUTIQUE (1/3) --- */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-1 order-2 lg:order-1">
            
            {hasAboutSection && (
              <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-walmart-darkBlue mb-4 sm:mb-6 flex items-center gap-2">
                  <span>📖</span> À propos de nous
                </h2>
                <div className="space-y-4 sm:space-y-6 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {shop.story && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 sm:mb-2">Notre Histoire</h3>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">{shop.story}</p>
                    </div>
                  )}
                  {shop.bio && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 sm:mb-2">Le Vendeur</h3>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">{shop.bio}</p>
                    </div>
                  )}
                  {shop.values && (
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                      <h3 className="text-xs sm:text-sm font-bold text-walmart-darkBlue uppercase tracking-wider mb-1 sm:mb-2">Nos Valeurs</h3>
                      <p className="text-xs sm:text-sm text-blue-900 whitespace-pre-wrap">{shop.values}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasPoliciesSection && (
              <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-walmart-darkBlue mb-4 sm:mb-6 flex items-center gap-2">
                  <span>🛡️</span> Confiance & Livraison
                </h2>
                <div className="space-y-4 sm:space-y-6 text-sm sm:text-base text-gray-600">
                  {shop.delivery_locations && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 sm:mb-2 flex items-center gap-2"><span>📍</span> Zones de livraison</h3>
                      <p className="text-xs sm:text-sm">{shop.delivery_locations}</p>
                    </div>
                  )}
                  {shop.return_policy && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 sm:mb-2 flex items-center gap-2"><span>🔄</span> Politique de retour</h3>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">{shop.return_policy}</p>
                    </div>
                  )}
                  {shop.policies && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 sm:mb-2 flex items-center gap-2"><span>📜</span> Garanties</h3>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">{shop.policies}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>

          {/* --- COLONNE DE DROITE : LE CATALOGUE PRODUITS (2/3) --- */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-8 border-b border-gray-200 pb-3 sm:pb-4">
              Notre catalogue d'articles ({products?.length || 0})
            </h2>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                      {product.cover_image_url ? (
                        <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-5xl">📷</span></div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <h3 className="text-sm sm:text-base text-gray-900 font-medium line-clamp-2 group-hover:text-walmart-blue transition-colors leading-tight">{product.title}</h3>
                      <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between">
                        <span className="text-base sm:text-lg font-bold text-walmart-darkBlue">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.price)}
                        </span>
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 text-walmart-blue flex items-center justify-center group-hover:bg-walmart-blue group-hover:text-white transition-colors text-sm sm:text-base">
                          +
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-20 bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
                <span className="text-4xl sm:text-5xl opacity-50 mb-3 sm:mb-4 block">📦</span>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Boutique en préparation</h3>
                <p className="text-sm sm:text-base text-gray-500">Cette boutique ajoutera bientôt ses articles.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}