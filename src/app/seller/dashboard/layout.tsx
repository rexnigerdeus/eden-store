import { createClient } from '@/utils/supabase/server'
import SellerLayoutUI from './SellerLayoutUI'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let shopName = "votre espace de gestion"
  let shopInitial = "V"
  let shopId = null
  let userId = user?.id || null

  if (user) {
    const { data: shop } = await supabase
      .from('shops')
      .select('id, name')
      .eq('seller_id', user.id)
      .single()
      
    if (shop && shop.name) {
      shopName = shop.name
      shopInitial = shop.name.charAt(0).toUpperCase() 
      shopId = shop.id
    }
  }

  // On passe toutes les infos au composant Client, y compris les ID pour les badges
  return (
    <SellerLayoutUI shopName={shopName} shopInitial={shopInitial} shopId={shopId} userId={userId}>
      {children}
    </SellerLayoutUI>
  )
}