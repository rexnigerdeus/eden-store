import Navbar from '@/components/Navbar'
import CheckoutClient from './CheckoutClient'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
  title: 'Validation de commande | EDEN MARKET',
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  // On injecte aussi l'email (qui vient de auth, pas de la table profiles)
  const userEmail = user?.email || null

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* On envoie le profil, l'email authentifié, ou "null" si c'est un invité */}
      <CheckoutClient userProfile={profile} userEmail={userEmail} />
    </div>
  )
}