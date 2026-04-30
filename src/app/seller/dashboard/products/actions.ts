'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  // 1. Vérification de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

  // 2. Extraction des données
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const imageFile = formData.get('image') as File 
  const category_id = formData.get('category_id') as string || null

  // 3. Gestion de la boutique par défaut
  let { data: shop } = await supabase.from('shops').select('id').eq('seller_id', user.id).single()

  if (!shop) {
    const { data: newShop, error: shopError } = await supabase.from('shops').insert({
        seller_id: user.id,
        name: `Boutique de ${user.email?.split('@')[0]}`,
        slug: `boutique-${user.id.substring(0, 8)}`,
      }).select('id').single()
    if (shopError) throw new Error("Erreur de boutique")
    shop = newShop
  }

  // --- NOUVEAU : 4. Upload de l'image dans Supabase Storage ---
  let cover_image_url = null;
  
  if (imageFile && imageFile.size > 0) {
    // On génère un nom de fichier unique pour éviter les conflits (ex: 12345-image.jpg)
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile)

    if (uploadError) {
      console.error("Erreur d'upload:", uploadError)
      redirect('/seller/dashboard/products/new?message=Erreur lors du téléchargement de l\'image')
    }

    // Si succès, on récupère l'URL publique de l'image pour la stocker en base
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)
      
    cover_image_url = publicUrl
  }

  // 5. Insérer le produit AVEC l'URL de l'image
  const { error: productError } = await supabase.from('products').insert({
      shop_id: shop!.id,
      title,
      description,
      price,
      cover_image_url,
      category_id,
    })

  if (productError) {
    console.error("Erreur d'insertion:", productError)
    redirect('/seller/dashboard/products/new?message=Erreur lors de la création du produit')
  }

  revalidatePath('/seller/dashboard/products')
  redirect('/seller/dashboard/products')
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

  // On supprime le produit (Le RLS de Supabase s'assurera qu'il a le droit)
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    console.error("Erreur de suppression:", error)
    return { error: "Impossible de supprimer le produit." }
  }

  // On rafraîchit la page pour faire disparaître le produit de la liste
  revalidatePath('/seller/dashboard/products')
  revalidatePath('/seller/dashboard', 'layout') // Met à jour le compteur de l'aperçu
  
  return { success: true }
}

export async function toggleProductStock(productId: string, currentStatus: boolean) {
  const supabase = await createClient()

  // On inverse le statut actuel (si c'était true, ça devient false, et inversement)
  const newStatus = !currentStatus

  const { error } = await supabase
    .from('products')
    .update({ is_available: newStatus })
    .eq('id', productId)

  if (error) {
    console.error("Erreur de mise à jour du stock:", error)
    return { error: "Impossible de modifier le statut." }
  }

  // On rafraîchit la page pour voir le changement instantanément
  revalidatePath('/seller/dashboard/products')
}