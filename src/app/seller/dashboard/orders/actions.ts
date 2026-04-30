'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()

  // On s'assure que l'utilisateur est connecté (le RLS bloquera si ce n'est pas SA commande)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non connecté")

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) {
    console.error("Erreur de mise à jour du statut:", error)
    return { error: "Impossible de mettre à jour la commande." }
  }

  // On rafraîchit la page des commandes du vendeur
  revalidatePath('/seller/dashboard/orders')
  // On pourrait aussi rafraîchir la page de suivi du client si on le voulait !
  
  return { success: true }
}