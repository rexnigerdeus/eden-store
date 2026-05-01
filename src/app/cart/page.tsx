import Navbar from '@/components/Navbar'
import CartClient from './CartClient'

export const metadata = {
  title: 'Mon Panier - EDEN store',
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* On peut utiliser notre Navbar Serveur ici sans problème ! */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">Mon Panier</h1>
        
        {/* On délègue toute la logique interactive à notre composant Client */}
        <CartClient />
      </main>
    </div>
  )
}