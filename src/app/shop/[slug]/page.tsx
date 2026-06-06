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

  const { data: shop, error: shopError } = await supabase.from('shops').select('*').eq('slug', shopSlug).single()
  if (shopError || !shop) notFound()

  const { data: products } = await supabase.from('products').select('*').eq('shop_id', shop.id).eq('is_available', true).order('created_at', { ascending: false })

  const hasAboutSection = shop.story || shop.bio || shop.values
  const hasPoliciesSection = shop.delivery_locations || shop.return_policy || shop.policies

  const { data: { user } } = await supabase.auth.getUser()
  let isSubscribed = false
  if (user && shop) {
    const { data: sub } = await supabase.from('subscriptions').select('id').eq('user_id', user.id).eq('shop_id', shop.id).single()
    isSubscribed = !!sub
  }

  const sectionTitleClasses = "text-xs font-montserrat font-black text-black uppercase tracking-widest mb-4 border-b border-black pb-2"

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pb-24">
        
        {/* --- HERO SECTION --- */}
        <div className="relative">
          {/* Bannière Brutaliste */}
          <div className="h-48 md:h-80 bg-gray-100 relative overflow-hidden border-b-2 border-black">
            {shop.banner_url ? (
              <img src={shop.banner_url} alt="Bannière" className="w-full h-full object-cover grayscale-[20%]" />
            ) : (
              <div className="w-full h-full bg-black opacity-5"></div>
            )}
          </div>

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 -mt-16 md:-mt-24 relative z-10 mb-12 md:mb-20">
              
              {/* Logo Carré Massif */}
              <div className="w-32 h-32 md:w-48 md:h-48 bg-white border-2 border-black overflow-hidden flex-shrink-0">
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center text-white text-5xl md:text-7xl font-montserrat font-black uppercase">
                    {shop.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Titre et Action */}
              <div className="pt-2 md:pt-28 flex-1 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-montserrat font-black text-black uppercase tracking-tight leading-none mb-2">
                    {shop.name}
                  </h1>
                  {shop.expertise && (
                    <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">{shop.expertise}</p>
                  )}
                </div>
                <div className="shrink-0">
                  <SubscribeButton shopId={shop.id} initialIsSubscribed={isSubscribed} isLoggedIn={!!user} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* --- COLONNE DE GAUCHE : INFOS (1/3) --- */}
          <div className="lg:w-1/3 space-y-8">
            
            {shop.description && (
              <div className="text-sm font-medium text-gray-600 leading-relaxed">
                {shop.description}
              </div>
            )}

            {/* Réseaux Sociaux Minimalistes */}
            {(shop.instagram || shop.facebook || shop.tiktok) && (
              <div className="flex flex-wrap gap-4 pt-4">
                {shop.instagram && <a href={shop.instagram} target="_blank" className="text-[10px] font-bold text-black uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors">Instagram</a>}
                {shop.facebook && <a href={shop.facebook} target="_blank" className="text-[10px] font-bold text-black uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors">Facebook</a>}
                {shop.tiktok && <a href={shop.tiktok} target="_blank" className="text-[10px] font-bold text-black uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors">TikTok</a>}
              </div>
            )}

            {hasAboutSection && (
              <div className="border border-gray-200 p-6 bg-gray-50">
                <h2 className={sectionTitleClasses}>Manifesto</h2>
                <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                  {shop.story && (
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notre Histoire</h3>
                      <p className="whitespace-pre-wrap">{shop.story}</p>
                    </div>
                  )}
                  {shop.bio && (
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Le Créateur</h3>
                      <p className="whitespace-pre-wrap">{shop.bio}</p>
                    </div>
                  )}
                  {shop.values && (
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Valeurs</h3>
                      <p className="text-black font-medium whitespace-pre-wrap">{shop.values}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasPoliciesSection && (
              <div className="border border-gray-200 p-6">
                <h2 className={sectionTitleClasses}>Informations d'achat</h2>
                <div className="space-y-6 text-sm text-gray-600">
                  {shop.delivery_locations && (
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Zones de livraison</h3>
                      <p>{shop.delivery_locations}</p>
                    </div>
                  )}
                  {shop.return_policy && (
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Politique de retour</h3>
                      <p className="whitespace-pre-wrap">{shop.return_policy}</p>
                    </div>
                  )}
                  {shop.policies && (
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Garanties</h3>
                      <p className="whitespace-pre-wrap">{shop.policies}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* --- COLONNE DE DROITE : PRODUITS (2/3) --- */}
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
              <h2 className="text-xl md:text-2xl font-montserrat font-black text-black uppercase tracking-tight">
                Collection
              </h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {products?.length || 0} Article(s)
              </span>
            </div>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                {products.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white">
                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden mb-4 border border-gray-100">
                      {product.cover_image_url ? (
                        <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl font-montserrat font-black uppercase">EDEN store</div>
                      )}
                    </div>
                    
                    <div className="flex flex-col">
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
            ) : (
              <div className="text-center py-20 bg-gray-50 border border-gray-200">
                <h3 className="text-xl font-montserrat font-black text-black uppercase tracking-widest mb-2">Boutique vide</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest">La collection n'est pas encore disponible.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}