'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(productId: string, shopId: string, rating: number, comment: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Vous devez être connecté pour laisser un avis." }
  if (rating < 1 || rating > 5) return { error: "La note doit être comprise entre 1 et 5." }

  try {
    // 1. VÉRIFICATION DE L'ACHAT : A-t-il vraiment acheté ce produit ?
    // On cherche si ce product_id existe dans un order_items lié à une commande de cet user_id
    const { data: hasBought } = await supabase
      .from('orders')
      .select('id, order_items!inner(product_id)')
      .eq('customer_id', user.id)
      .eq('order_items.product_id', productId)
      .limit(1)

    if (!hasBought || hasBought.length === 0) {
      return { error: "Vous devez avoir acheté ce produit pour laisser un avis vérifié." }
    }

    // 2. ENREGISTREMENT DE L'AVIS
    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id: productId,
        shop_id: shopId,
        rating: rating,
        comment: comment.trim() || null
      })

    if (insertError) {
      if (insertError.code === '23505') return { error: "Vous avez déjà laissé un avis sur ce produit." }
      throw insertError
    }

    // Rafraîchir la page produit pour afficher le nouvel avis
    revalidatePath(`/product/${productId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error("Erreur avis:", error)
    return { error: "Une erreur est survenue lors de l'envoi de votre avis." }
  }
}