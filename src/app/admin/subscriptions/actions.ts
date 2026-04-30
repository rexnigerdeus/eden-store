'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function extendSubscription(shopId: string, type: 'monthly' | 'annual') {
  // 1. On récupère la boutique pour voir si elle a déjà une date de fin
  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('subscription_end_date')
    .eq('id', shopId)
    .single()

  // 2. On calcule la nouvelle date
  // Si la boutique a déjà une date valide dans le futur, on ajoute le temps à partir de cette date.
  // Sinon, on commence à compter à partir d'aujourd'hui.
  const now = new Date()
  let baseDate = now
  if (shop?.subscription_end_date) {
    const currentEndDate = new Date(shop.subscription_end_date)
    if (currentEndDate > now) {
      baseDate = currentEndDate
    }
  }

  // Ajout du temps (1 mois ou 1 an)
  if (type === 'monthly') {
    baseDate.setMonth(baseDate.getMonth() + 1)
  } else if (type === 'annual') {
    baseDate.setFullYear(baseDate.getFullYear() + 1)
  }

  // 3. On met à jour la base de données
  const { error } = await supabaseAdmin
    .from('shops')
    .update({ 
      subscription_end_date: baseDate.toISOString(),
      subscription_status: 'active' // On repasse automatiquement en actif
    })
    .eq('id', shopId)

  if (error) console.error("Erreur lors de l'extension de l'abonnement:", error)
  
  revalidatePath('/admin/subscriptions')
}