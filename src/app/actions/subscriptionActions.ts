'use server'

import { createClient } from '@/utils/supabase/server'

export async function toggleSubscription(shopId: string, isCurrentlySubscribed: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Vous devez être connecté pour vous abonner." }
  }

  try {
    if (isCurrentlySubscribed) {
      // Désabonnement
      await supabase
        .from('subscriptions')
        .delete()
        .match({ user_id: user.id, shop_id: shopId })
    } else {
      // Abonnement
      await supabase
        .from('subscriptions')
        .insert({ user_id: user.id, shop_id: shopId })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Erreur abonnement:", error)
    return { error: "Une erreur est survenue." }
  }
}