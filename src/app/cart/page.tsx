import Navbar from '@/components/Navbar'
import CartClient from './CartClient'

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight mb-8 md:mb-12 border-b border-gray-200 pb-4">
          Mon Panier
        </h1>
        
        <CartClient />
      </main>
    </div>
  )
}