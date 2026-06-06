'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getInfiniteProducts } from '@/app/actions/productActions'

interface Product {
  id: string
  title: string
  price: number
  cover_image_url: string
  shops: { name: string; slug: string }
}

export default function InfiniteProductList({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (firstEntry.isIntersecting && hasMore && !loading) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page])

  const loadMoreProducts = async () => {
    setLoading(true)
    const nextProducts = await getInfiniteProducts(page, 8)
    
    if (nextProducts.length === 0) {
      setHasMore(false)
    } else {
      setProducts((prev) => [...prev, ...nextProducts])
      setPage((prev) => prev + 1)
    }
    setLoading(false)
  }

  return (
    <div>
      {/* GRILLE DE PRODUITS (Style Fashion: 2 colonnes mobile, 4 colonnes desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white">
            
            {/* L'image (Format portrait 3/4 très utilisé dans la mode) */}
            <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden mb-4">
              {product.cover_image_url ? (
                <img 
                  src={product.cover_image_url} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">EDEN store</div>
              )}
              
              {/* Badge optionnel "Nouveau" ou "Vendeur" */}
              <div className="absolute top-2 left-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                Nouveau
              </div>
            </div>

            {/* Les informations (Minimalistes, majuscules) */}
            <div className="flex flex-col">
              <p className="text-[10px] md:text-xs text-gray-500 mb-1 uppercase tracking-widest font-semibold truncate">
                {product.shops?.name}
              </p>
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

      {/* Le déclencheur de chargement (Loader) */}
      <div ref={loaderRef} className="mt-16 text-center py-4">
        {loading && (
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-black border-r-transparent align-[-0.125em]"></div>
        )}
        {!hasMore && products.length > 0 && (
          <div className="mt-8">
            <p className="text-black font-montserrat font-bold uppercase tracking-widest text-xl mb-4">Fin de la collection</p>
            <Link href="#top" className="text-sm text-gray-500 uppercase tracking-widest border-b border-gray-500 pb-1 hover:text-black hover:border-black transition-colors">
              Retour en haut
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}