import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CopyButton from '@/components/CopyButton'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const resolvedParams = await searchParams
  const orderId = resolvedParams.orderId

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          
          {/* Icône de succès animée (simple) */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
          </div>

          <h1 className="text-3xl font-bold text-walmart-darkBlue mb-4">
            Commande confirmée !
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Merci pour votre achat. Le vendeur a été notifié et vous contactera très prochainement au numéro indiqué pour organiser la livraison.
          </p>

          {orderId && (
            <div className="bg-gray-50 p-4 rounded-lg mb-8 text-left border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Numéro de suivi (référence) :</p>
              {/* 2. NOUVEL AFFICHAGE AVEC LE BOUTON */}
              <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md">
                <p className="font-mono text-gray-900 font-medium truncate">{orderId}</p>
                <CopyButton textToCopy={orderId} />
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <Link 
              href="/"
              className="w-full py-4 bg-walmart-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              Continuer mes achats
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}