'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'

/**
 * Vérifie le statut de stock (en rupture ou non) pour une liste d'IDs de produits.
 * Retourne un Set d'IDs qui sont en rupture.
 */
export async function checkCartStock(productIds: string[]): Promise<{ outOfStockIds: string[] }> {
  if (!productIds || productIds.length === 0) {
    return { outOfStockIds: [] }
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, is_available')
    .in('id', productIds)

  if (error) {
    console.error("Erreur vérification stock :", error)
    return { outOfStockIds: [] }
  }

  const outOfStockIds = (data || [])
    .filter((p) => p.is_available === false)
    .map((p) => p.id)

  return { outOfStockIds }
}
