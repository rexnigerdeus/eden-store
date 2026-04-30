import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import ProductActions from './ProductActions'

export default async function ProductsPage() {
  // 1. Initialiser le client Supabase serveur
  const supabase = await createClient()

  // 2. Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Récupérer les produits du vendeur
  let products: any[] = []
  
  if (user) {
    // Cette requête récupère les produits liés à la boutique de l'utilisateur
    // et les trie du plus récent au plus ancien.
    const { data, error } = await supabase
      .from('products')
      .select('*, shops!inner(id)')
      .eq('shops.seller_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      products = data
    }
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête de la page avec le bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-walmart-darkBlue">Mes Produits</h1>
          <p className="text-gray-500 mt-1">Gérez votre catalogue d'articles.</p>
        </div>
        
        <Link 
          href="/seller/dashboard/products/new"
          className="px-4 py-2 bg-walmart-blue text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          + Nouveau produit
        </Link>
      </div>
      
      {/* Affichage Conditionnel : Si aucun produit, on montre l'état vide */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center mt-8">
          <div className="w-16 h-16 bg-walmart-light text-walmart-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
            📦
          </div>
          <h3 className="text-lg font-medium text-walmart-darkBlue mb-2">
            Aucun produit pour le moment
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Votre catalogue est vide. Ajoutez votre premier produit pour commencer à vendre sur Asim.
          </p>
        </div>
      ) : (
        /* Si on a des produits, on affiche la grille */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              
              {/* Affichage de l'image du produit */}
              <div className="h-48 bg-gray-100 border-b border-gray-100 relative group overflow-hidden">
                {product.cover_image_url ? (
                  /* Note: On utilise une balise <img> standard ici pour la simplicité. 
                     En production, Next.js recommande <Image> mais cela nécessite une config supplémentaire. */
                  <img 
                    src={product.cover_image_url} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">📷</span>
                  </div>
                )}
                {/* Nos vrais boutons d'action interactifs avec la gestion du stock */}
                  <ProductActions productId={product.id} isAvailable={product.is_available} />
              </div>

              {/* Informations du produit */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-walmart-darkBlue truncate" title={product.title}>
                  {product.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2 flex-1">
                  {product.description}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-walmart-blue">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.price)}
                  </span>
                  
                  {/* Boutons d'action (Modifier / Supprimer) */}
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