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
    <div className="max-w-[800px] mx-auto space-y-8">
      
      {/* EN-TÊTE BRUTALISTE */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-montserrat font-black text-black uppercase tracking-tight">Mon Profil</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">
          Gérer vos informations personnelles et vos paramètres de compte
        </p>
      </div>

      <div className="bg-white">
        <ProfileForm profile={profile} email={user?.email || ''} />
      </div>
      
    </div>
  )
}