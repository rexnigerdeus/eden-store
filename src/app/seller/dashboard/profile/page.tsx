import { createClient } from '@/utils/supabase/server'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-walmart-darkBlue">Mon Profil Personnel</h1>
        <p className="text-gray-500 mt-1">Gérez vos informations personnelles et vos paramètres de compte.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        {/* On passe le profil et l'email de l'utilisateur de manière sécurisée */}
        <ProfileForm profile={profile} email={user?.email || ''} />
      </div>
    </div>
  )
}