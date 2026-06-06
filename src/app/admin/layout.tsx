import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminLayoutUI from './dashboard/AdminLayoutUI'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Sécurité : on vérifie que c'est bien un Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const adminEmail = user.email ?? 'admin@asim.io'
  const adminInitial = (adminEmail.charAt(0) || 'A').toUpperCase()

  return (
    <AdminLayoutUI adminEmail={adminEmail} adminInitial={adminInitial}>
      {children}
    </AdminLayoutUI>
  )
}