import Navbar from '@/components/Navbar'
import CheckoutClient from './CheckoutClient'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
  title: 'Caisse - EDEN store',
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* On envoie le profil, ou "null" si c'est un invité */}
      <CheckoutClient userProfile={profile} />
    </div>
  )
}