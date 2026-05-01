import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Sécurité ultime : On vérifie que c'est bien un Admin !
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    redirect('/') // On le renvoie à l'accueil s'il essaie de tricher
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 bg-walmart-darkBlue text-white md:min-h-screen p-6 flex flex-col">
        <div className="mb-10">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-walmart-yellow tracking-wider">
            EDEN store ADMIN
          </Link>
          <p className="text-xs text-blue-200 mt-1">Superviseur Global</p>
        </div>

        <nav className="flex-1 space-y-2">
          {/* Pour l'instant nous créons le lien Catégories, nous ajouterons les autres après */}
          <Link href="/admin/dashboard" className="block px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800 transition-colors">
            📊 Vue d'ensemble
          </Link>
          <Link href="/admin/categories" className="block px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800 transition-colors">
            🏷️ Catégories
          </Link>
          <Link href="/admin/shops" className="block px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800 transition-colors">
            🏪 Boutiques & Vendeurs
          </Link>
          <Link href="/admin/subscriptions" className="block px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800 transition-colors">
            💳 Abonnements
          </Link>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-blue-800">
          <Link href="/" className="text-sm text-blue-300 hover:text-white transition-colors">
            &larr; Retour au site public
          </Link>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}