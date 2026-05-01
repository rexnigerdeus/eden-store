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
  const [page, setPage] = useState(1) // On commence à la page 1 (puisque la page 0 est initialProducts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        // Si le div "loaderRef" entre dans l'écran, qu'on a encore des produits et qu'on ne charge pas déjà
        if (firstEntry.isIntersecting && hasMore && !loading) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 } // Se déclenche quand 10% du loader est visible
    )

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page])

  const loadMoreProducts = async () => {
    setLoading(true)
    const nextProducts = await getInfiniteProducts(page, 8)
    
    if (nextProducts.length === 0) {
      setHasMore(false) // Plus de produits à charger
    } else {
      setProducts((prev) => [...prev, ...nextProducts])
      setPage((prev) => prev + 1)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
              {product.cover_image_url ? (
                <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl md:text-3xl">📷</div>
              )}
            </div>
            <div className="p-3 md:p-4 flex flex-col flex-1">
              <p className="text-[10px] md:text-xs text-gray-500 mb-1 line-clamp-1">{product.shops?.name}</p>
              <h3 className="text-sm md:text-base text-gray-900 font-medium line-clamp-2 leading-tight group-hover:text-walmart-blue transition-colors">{product.title}</h3>
              <div className="mt-auto pt-2 md:pt-3">
                <span className="text-base md:text-lg font-bold text-walmart-darkBlue">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.price)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Le déclencheur de chargement */}
      <div ref={loaderRef} className="mt-8 text-center py-4">
        {loading && (
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-walmart-blue border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        )}
        {!hasMore && products.length > 0 && (
          <p className="text-gray-500 text-sm">Vous avez vu tous les produits ! 🎉</p>
        )}
      </div>
    </div>
  )
}