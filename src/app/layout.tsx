import type { Metadata, Viewport } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext' 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ 
  subsets: ['latin'], 
  weight: ['500', '700', '800', '900'],
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'EDEN MARKET | La Marketplace',
  description: 'Soutenir. Bâtir. Grandir ensemble.',
}

// Empêche le zoom automatique des navigateurs sur les champs < 16px
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} font-sans bg-white text-black`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}