'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateShopSettings(formData: FormData) {
  const supabase = await createClient()

  // 1. Vérification de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

  // On récupère le nom obligatoirement
  const name = formData.get('name') as string
  if (!name) return { error: "Le nom de la boutique est requis." }

  // 2. Préparation de l'objet de mise à jour/création
  const updates: any = {
    name: name,
    whatsapp: formData.get('whatsapp') as string,
    delivery_locations: formData.get('delivery_locations') as string,
    description: formData.get('description') as string,
    expertise: formData.get('expertise') as string,
    bio: formData.get('bio') as string,
    story: formData.get('story') as string,
    values: formData.get('values') as string,
    policies: formData.get('policies') as string,
    return_policy: formData.get('return_policy') as string,
    instagram: formData.get('instagram') as string,
    facebook: formData.get('facebook') as string,
    tiktok: formData.get('tiktok') as string,
  }

  // Nettoyage des champs vides
  Object.keys(updates).forEach(key => updates[key] == null && delete updates[key])

  // 3. Fonction utilitaire pour uploader une image
  async function uploadImage(file: File | null, folderName: string) {
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${folderName}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error } = await supabase.storage.from('shop-assets').upload(fileName, file)
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('shop-assets').getPublicUrl(fileName)
        return publicUrl
      }
      console.error(`Erreur upload ${folderName}:`, error)
    }
    return null
  }

  // 4. Traitement des fichiers (Logo et Bannière)
  const logoFile = formData.get('logo') as File
  const bannerFile = formData.get('banner') as File

  const logoUrl = await uploadImage(logoFile, 'logos')
  if (logoUrl) updates.logo_url = logoUrl

  const bannerUrl = await uploadImage(bannerFile, 'banners')
  if (bannerUrl) updates.banner_url = bannerUrl

  // 5. VÉRIFICATION : Le vendeur a-t-il déjà une boutique ?
  // On utilise maybeSingle() pour ne pas déclencher d'erreur si la boutique n'existe pas
  const { data: existingShop } = await supabase
    .from('shops')
    .select('id')
    .eq('seller_id', user.id)
    .maybeSingle()

  if (existingShop) {
    // ---> CAS A : LA BOUTIQUE EXISTE, ON MET À JOUR (UPDATE)
    const { error } = await supabase
      .from('shops')
      .update(updates)
      .eq('seller_id', user.id)

    if (error) {
      console.error("Erreur de mise à jour:", error)
      return { error: "Impossible de mettre à jour la boutique." }
    }
  } else {
    // ---> CAS B : PREMIÈRE VISITE, ON CRÉE LA BOUTIQUE (INSERT)
    // On génère le slug proprement
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const { error } = await supabase
      .from('shops')
      .insert({
        ...updates,
        seller_id: user.id, // Lien avec le vendeur
        slug: slug
      })

    if (error) {
      console.error("Erreur de création:", error)
      return { error: "Impossible de créer la boutique. Ce nom est peut-être déjà pris." }
    }
  }

  // 6. Rafraîchissement du cache
  revalidatePath('/seller/dashboard/settings')
  revalidatePath('/seller/dashboard', 'layout')
  revalidatePath('/shop/[slug]', 'page') 
  
  return { success: existingShop ? "Boutique mise à jour avec succès !" : "Félicitations, votre boutique est créée !" }
}