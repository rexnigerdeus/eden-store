import { createClient } from '@/utils/supabase/server'
import ShopForm from './ShopForm' // Import du nouveau composant

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let shop = null

  if (user) {
    const { data } = await supabase.from('shops').select('*').eq('seller_id', user.id).single()
    shop = data
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-walmart-darkBlue">Ma Boutique</h1>
        <p className="text-gray-500 mt-1">Personnalisez l'apparence et les informations de votre vitrine publique.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8">
        <section>
          <h2 className="text-lg font-medium text-walmart-darkBlue border-b border-gray-100 pb-2 mb-4">
            Identité de la boutique
          </h2>
          
          {/* On appelle le formulaire interactif ici */}
          <ShopForm shop={shop} />

        </section>
      </div>
    </div>
  )
}