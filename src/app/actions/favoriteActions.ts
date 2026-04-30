'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(productId: string, isCurrentlyFavorited: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si l'utilisateur n'est pas connecté, on bloque l'action
  if (!user) {
    return { error: "Vous devez être connecté pour ajouter un favori." }
  }

  try {
    if (isCurrentlyFavorited) {
      // S'il était déjà en favori, on le supprime
      await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, product_id: productId })
    } else {
      // Sinon, on l'ajoute
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId })
    }

    // Rafraîchir la page produit en arrière-plan
    revalidatePath(`/product/${productId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error("Erreur favori:", error)
    return { error: "Une erreur est survenue." }
  }
}