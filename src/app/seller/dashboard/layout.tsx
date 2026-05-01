import { createClient } from '@/utils/supabase/server'
import SellerLayoutUI from './SellerLayoutUI' // <-- Import du nouveau composant

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  // Récupération des données du serveur
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
      shopInitial = shop.name.charAt(0).toUpperCase() 
    }
  }

  // On passe les données au composant Client qui s'occupe de l'affichage
  return (
    <SellerLayoutUI shopName={shopName} shopInitial={shopInitial}>
      {children}
    </SellerLayoutUI>
  )
}