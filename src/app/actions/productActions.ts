'use server'

import { createClient } from '@/utils/supabase/server'

// Cette fonction récupère un "paquet" de produits basé sur le numéro de page
export async function getInfiniteProducts(page: number, limit: number = 8) {
  const supabase = await createClient()
  
  // Calcul de l'index de départ et de fin
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('products')
    .select('*, shops!inner(name, slug)')
    .eq('is_available', true)
    .eq('shops.subscription_status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Erreur lors de la récupération des produits :", error)
    return []
  }

  return data || []
}