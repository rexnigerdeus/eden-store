import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext' // <-- 1. Import du panier

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eden Store - La Marketplace',
  description: 'Achetez et vendez facilement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* <-- 2. On enveloppe l'application avec le CartProvider --> */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}