import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav' // <-- Import du nouveau menu avec badges

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-black text-white md:min-h-screen flex flex-col border-r border-white/10 shrink-0">
        <div className="p-6 md:p-8 border-b border-white/10 mb-6">
          <Link href="/admin/dashboard" className="text-2xl font-montserrat font-black text-white uppercase tracking-tighter block mb-1">
            EDEN store. <span className="text-gray-500">ADMIN</span>
          </Link>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Superviseur Global</p>
        </div>
        
        {/* LE MENU CLIENT AVEC LES NOTIFICATIONS */}
        <AdminNav />
        
        <div className="p-6 border-t border-white/10 mt-auto">
          <Link href="/" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors block text-center border border-gray-800 py-3 hover:border-gray-500">
            Retour au site public
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-8 md:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}