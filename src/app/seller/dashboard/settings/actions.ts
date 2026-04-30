'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateShopSettings(formData: FormData) {
  const supabase = await createClient()

  // 1. Vérification de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

  // 2. Préparation de l'objet de mise à jour avec les anciens et nouveaux champs
  const updates: any = {
    // Infos de base
    name: formData.get('name') as string,
    whatsapp: formData.get('whatsapp') as string,
    delivery_locations: formData.get('delivery_locations') as string,
    description: formData.get('description') as string, // Ton ancien champ
    
    // Nouveaux champs Mini-Site
    expertise: formData.get('expertise') as string,
    bio: formData.get('bio') as string,
    story: formData.get('story') as string,
    values: formData.get('values') as string,
    policies: formData.get('policies') as string, // Remplace ou complète ton 'return_policy'
    return_policy: formData.get('return_policy') as string, // Ton ancien champ (conservé au cas où)
    
    // Réseaux sociaux
    instagram: formData.get('instagram') as string,
    facebook: formData.get('facebook') as string,
    tiktok: formData.get('tiktok') as string,
  }

  // Petit nettoyage : on supprime les champs null ou undefined de l'objet 'updates'
  // pour éviter d'écraser des données en base avec du vide si le champ n'est pas dans le formulaire
  Object.keys(updates).forEach(key => updates[key] == null && delete updates[key])

  // 3. Fonction utilitaire pour uploader une image si elle est présente
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
  if (logoUrl) updates.logo_url = logoUrl // On ne met à jour que s'il y a un nouveau fichier

  const bannerUrl = await uploadImage(bannerFile, 'banners')
  if (bannerUrl) updates.banner_url = bannerUrl

  // 5. Envoi à Supabase
  const { error } = await supabase
    .from('shops')
    .update(updates)
    .eq('seller_id', user.id)

  if (error) {
    console.error("Erreur de mise à jour:", error)
    return { error: "Impossible de mettre à jour la boutique." }
  }

  // 6. Rafraîchissement des pages pour afficher les nouveautés
  revalidatePath('/seller/dashboard/settings')
  revalidatePath('/seller/dashboard', 'layout') // Rafraîchit aussi le Layout
  
  // On rafraîchit aussi la vitrine publique pour que le client voie les changements
  revalidatePath('/shop/[slug]', 'page') 
  
  return { success: "Boutique mise à jour avec succès !" }
}