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

  // LA SÉCURITÉ PUBLIQUE : On ne montre que les abonnements VALIDES !
  const nowISO = new Date().toISOString()

  let query = supabase
    .from('shops')
    .select('id, name, slug, logo_url, expertise, delivery_locations')
    .eq('subscription_status', 'active')
    .gte('subscription_end_date', nowISO) // <-- La date doit être supérieure à aujourd'hui
    .order('name', { ascending: true })

  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`)
  }

  const { data: shops } = await query

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <div className="bg-gray-50 border-b border-gray-200 py-12 md:py-20 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-montserrat font-black text-black uppercase tracking-tight mb-4">
            Nos Marques
          </h1>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-bold mb-10">
            Découvrez l'élite de nos vendeurs partenaires.
          </p>

          <form action="/shops" method="GET" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-black font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="RECHERCHER UNE BOUTIQUE..."
                className="w-full pl-12 pr-4 py-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors uppercase tracking-widest rounded-none"
              />
            </div>
            <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors border-2 border-black rounded-none">
              Rechercher
            </button>
          </form>
          
          {searchQuery && (
             <p className="mt-6 text-xs text-gray-500 font-bold uppercase tracking-widest">
               Résultats pour "<span className="text-black">{searchQuery}</span>" ({shops?.length || 0})
             </p>
          )}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12 md:py-16">
        {shops && shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.slug}`} className="group flex flex-col bg-white border-2 border-black hover:border-red-600 transition-colors p-8 items-center text-center">
                <div className="w-24 h-24 bg-gray-100 border-2 border-black mb-6 overflow-hidden flex-shrink-0">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center text-white text-3xl font-montserrat font-black uppercase">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <h3 className="font-montserrat font-black text-xl text-black uppercase tracking-widest mb-2 group-hover:underline">{shop.name}</h3>
                
                {shop.expertise && (
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 line-clamp-2">{shop.expertise}</p>
                )}
                
                <div className="mt-auto pt-4 border-t border-gray-200 w-full text-center">
                  <span className="text-xs font-bold text-black uppercase tracking-widest group-hover:text-red-600 transition-colors">
                    Explorer &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 md:py-32 bg-gray-50 border-2 border-black">
            <h3 className="text-2xl md:text-3xl font-montserrat font-black text-black uppercase tracking-tight mb-4">Aucune marque trouvée</h3>
            <p className="text-sm md:text-base text-gray-500 uppercase tracking-widest mb-8">Il n'y a pas de boutiques avec cet abonnement valide.</p>
            {searchQuery && (
              <Link href="/shops" className="inline-block px-10 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors border-2 border-black">
                Voir toutes les marques
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}