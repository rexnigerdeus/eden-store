'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// Changer le niveau de la boutique (Standard <-> Partenaire)
export async function toggleShopTier(shopId: string, currentTier: string) {
  const newTier = currentTier === 'standard' ? 'partner' : 'standard'
  
  const { error } = await supabaseAdmin
    .from('shops')
    .update({ subscription_tier: newTier })
    .eq('id', shopId)

  if (error) console.error("Erreur toggle tier:", error)
  revalidatePath('/admin/shops')
}

// Changer le statut de la boutique (Actif, En attente, Impayé, Expiré)
export async function updateShopStatus(shopId: string, newStatus: string) {
  // Si on active la boutique, on peut aussi définir sa date de fin d'abonnement (ex: +30 jours)
  // Pour garder ça simple, on change juste le statut ici.
  const { error } = await supabaseAdmin
    .from('shops')
    .update({ subscription_status: newStatus })
    .eq('id', shopId)

  if (error) console.error("Erreur update status:", error)
  revalidatePath('/admin/shops')
}