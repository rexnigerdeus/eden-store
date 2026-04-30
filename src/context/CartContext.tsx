'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// La structure d'un article dans le panier
export type CartItem = {
  product_id: string
  title: string
  price: number
  quantity: number
  shop_id: string
  shop_name: string
  cover_image_url: string
}

// Les fonctions que notre panier saura faire
type CartContextType = {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 1. Au chargement du site, on récupère le panier sauvegardé dans le navigateur
  useEffect(() => {
    const savedCart = localStorage.getItem('asim_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Erreur de lecture du panier", e)
      }
    }
    setIsLoaded(true)
  }, [])

  // 2. À chaque modification du panier, on sauvegarde dans le navigateur
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('asim_cart', JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  // --- ACTIONS DU PANIER ---

  const addToCart = (newItem: CartItem) => {
    setCart((currentCart) => {
      // Si le produit est déjà dans le panier, on augmente juste la quantité
      const existingItem = currentCart.find(item => item.product_id === newItem.product_id)
      if (existingItem) {
        return currentCart.map(item => 
          item.product_id === newItem.product_id 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }
      // Sinon on l'ajoute comme nouvel article
      return [...currentCart, newItem]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((currentCart) => currentCart.filter(item => item.product_id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setCart((currentCart) => 
      currentCart.map(item => 
        item.product_id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => setCart([])

  // --- CALCULS ---
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

// Fonction raccourci pour utiliser le panier partout
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart doit être utilisé à l\'intérieur d\'un CartProvider')
  }
  return context
}