import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import { redirect } from 'next/navigation'
import OrdersTabs from './OrdersTabs'
import AccountSidebar from './AccountSidebar'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()

  // 1. Vérifier si l'utilisateur est connecté
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. VÉRIFICATION : L'utilisateur est-il aussi un vendeur ?
  const { data: shop } = await supabase
    .from('shops')
    .select('id, name')
    .eq('seller_id', user.id)
    .maybeSingle()

  // 4. Récupérer l'historique de SES commandes
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      shops(id, name, slug, whatsapp),
      order_items(
        quantity,
        price_at_time,
        products(title, cover_image_url)
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 py-8 md:py-16">
        
        {/* EN-TÊTE DU COMPTE */}
        <div className="mb-10 md:mb-16 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">Mon Compte</h1>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-bold mt-3">
            Bienvenue, {profile?.full_name || user?.user_metadata?.full_name || 'Client'}.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* MENU LATÉRAL */}
          <div className="lg:w-64 flex-shrink-0">
            <AccountSidebar userId={user.id} hasShop={!!shop} />
          </div>

          {/* CONTENU PRINCIPAL : HISTORIQUE */}
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-montserrat font-black text-black uppercase tracking-tight mb-8">Historique des achats</h2>

            <OrdersTabs orders={orders || []} />
          </div>
        </div>
      </main>
    </div>
  )
}