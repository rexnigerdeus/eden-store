'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function extendSubscription(shopId: string, type: 'monthly' | 'annual') {
  // 1. On récupère la boutique pour voir si elle a déjà une date de fin
  const { data: shop } = await supabaseAdmin.from('shops').select('subscription_end_date').eq('id', shopId).single()

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

  if (type === 'monthly') {
    baseDate.setMonth(baseDate.getMonth() + 1)
  } else if (type === 'annual') {
    baseDate.setFullYear(baseDate.getFullYear() + 1)
  }

  const { error } = await supabaseAdmin.from('shops').update({ 
      subscription_end_date: baseDate.toISOString(),
      subscription_status: 'active' 
    }).eq('id', shopId)

  if (error) console.error("Erreur lors de l'extension de l'abonnement:", error)
  revalidatePath('/admin/subscriptions')
}

// --- NOUVELLE FONCTION : MISE À JOUR DES TARIFS ---
export async function updatePricing(formData: FormData) {
  const standardMonthly = formData.get('standard_monthly')
  const standardAnnual = formData.get('standard_annual')
  const partnerMonthly = formData.get('partner_monthly')
  const partnerAnnual = formData.get('partner_annual')

  // On utilise un upsert pour mettre à jour les clés
  const updates = [
    { setting_key: 'standard_monthly', setting_value: Number(standardMonthly) },
    { setting_key: 'standard_annual', setting_value: Number(standardAnnual) },
    { setting_key: 'partner_monthly', setting_value: Number(partnerMonthly) },
    { setting_key: 'partner_annual', setting_value: Number(partnerAnnual) },
  ]

  const { error } = await supabaseAdmin.from('platform_settings').upsert(updates)
  
  if (error) {
    console.error("Erreur lors de la mise à jour des prix:", error)
    return { error: "Impossible de mettre à jour les tarifs." }
  }

  revalidatePath('/admin/subscriptions')
  revalidatePath('/seller/dashboard/billing')
  return { success: true }
}