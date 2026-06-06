import type { Metadata } from 'next'
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
  title: 'EDEN store | La Marketplace',
  description: 'Soutenir. Bâtir. Grandir ensemble.',
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