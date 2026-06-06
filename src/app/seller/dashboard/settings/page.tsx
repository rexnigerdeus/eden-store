import { createClient } from '@/utils/supabase/server'
import ShopForm from './ShopForm' 

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let shop = null

  if (user) {
    const { data } = await supabase.from('shops').select('*').eq('seller_id', user.id).single()
    shop = data
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      
      {/* EN-TÊTE BRUTALISTE */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-montserrat font-black text-black uppercase tracking-tight">Configuration Boutique</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">Gérez votre identité et votre vitrine publique</p>
      </div>

      <div className="bg-white">
        <ShopForm shop={shop} />
      </div>
      
    </div>
  )
}