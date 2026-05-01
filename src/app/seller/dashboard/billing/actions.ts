'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function notifyPaymentMade(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

  // On met à jour le statut de la boutique pour dire qu'une vérification est en attente
  const { error } = await supabase
    .from('shops')
    .update({ subscription_status: 'pending_verification' })
    .eq('seller_id', user.id)

  if (error) {
    console.error("Erreur lors de la notification:", error)
    return
  }

  // On rafraîchit la page de facturation
  revalidatePath('/seller/dashboard/billing')
}