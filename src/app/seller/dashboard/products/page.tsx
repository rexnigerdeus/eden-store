import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import ProductActions from './ProductActions'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let products: any[] = []
  
  if (user) {
    const { data } = await supabase
      .from('products')
      .select('*, shops!inner(id)')
      .eq('shops.seller_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      products = data
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      
      {/* EN-TÊTE : Minimaliste & Brut */}
      <div className="border-b border-gray-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-black text-black uppercase tracking-tight">Catalogue Articles</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Gérez votre inventaire public</p>
        </div>
        
        <Link 
          href="/seller/dashboard/products/new"
          className="w-full sm:w-auto text-center px-6 py-4 bg-red-600 text-white font-montserrat font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-colors"
        >
          + Ajouter un produit
        </Link>
      </div>
      
      {/* ÉTAT VIDE */}
      {products.length === 0 ? (
        <div className="bg-gray-50 p-12 border-2 border-black text-center">
          <h3 className="text-xl font-montserrat font-black text-black uppercase tracking-widest mb-2">Inventaire vide</h3>
          <p className="text-xs uppercase tracking-widest text-gray-500">Ajoutez votre premier produit pour commencer à vendre.</p>
        </div>
      ) : (
        /* GRILLE DE PRODUITS (Inventaire Strict) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border-2 border-black flex flex-col group relative">
              
              {/* Image du produit */}
              <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden border-b-2 border-black">
                {product.cover_image_url ? (
                  <img 
                    src={product.cover_image_url} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-montserrat font-black uppercase text-gray-300">
                    EDEN MARKET
                  </div>
                )}
                
                {/* Badge Statut (Stock) */}
                <div className={`absolute top-0 left-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-r-2 border-b-2 border-black ${product.is_available ? 'bg-white text-black' : 'bg-red-600 text-white'}`}>
                  {product.is_available ? 'Disponible' : 'En rupture'}
                </div>
              </div>

              {/* Infos Produit */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-montserrat font-black text-black uppercase tracking-wide truncate mb-1">
                  {product.title}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-2 mb-4">
                  {product.description}
                </p>
                
                <div className="mt-auto border-t border-gray-100 pt-3 flex flex-col gap-3">
                  <span className="text-lg font-montserrat font-black text-black">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(product.price)}
                  </span>
                  
                  {/* Nos boutons d'action interactifs stylisés */}
                  <ProductActions productId={product.id} isAvailable={product.is_available} />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}