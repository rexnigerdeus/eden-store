import Link from 'next/link'
import { logout } from '../auth/actions'
import NavLinks from './nav-links'
import { createClient } from '@/utils/supabase/server' // NOUVEL IMPORT

// Ajout du mot-clé "async" ici car nous allons interroger la base de données
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  // --- NOUVEAU : Récupération du nom de la boutique ---
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let shopName = "votre espace de gestion"
  let shopInitial = "V"

  if (user) {
    const { data: shop } = await supabase
      .from('shops')
      .select('name')
      .eq('seller_id', user.id)
      .single()
      
    if (shop && shop.name) {
      shopName = shop.name
      // On prend la première lettre du nom pour l'avatar
      shopInitial = shop.name.charAt(0).toUpperCase() 
    }
  }

  return (
    <div className="flex h-screen bg-walmart-light">
      
      <aside className="w-64 bg-walmart-darkBlue text-white flex flex-col">
        <div className="p-6">
          <span className="text-2xl font-bold text-walmart-yellow tracking-wider">ASIM</span>
          <span className="ml-2 text-sm text-gray-300 font-medium">Espace Vendeur</span>
        </div>
        
        <NavLinks />

        <div className="p-4 border-t border-white/10">
          <form action={logout}>
            <button type="submit" className="w-full text-left px-4 py-2 text-gray-300 hover:text-walmart-yellow transition-colors font-medium">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          {/* AFFICHAGE DYNAMIQUE ICI */}
          <h2 className="text-lg font-medium text-walmart-darkBlue">
            Bienvenue dans {shopName}
          </h2>
          <div className="w-9 h-9 bg-walmart-blue rounded-full flex items-center justify-center text-white font-bold shadow-sm">
            {shopInitial}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
      
    </div>
  )
}