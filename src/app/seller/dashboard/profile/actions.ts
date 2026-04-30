'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // 1. Vérification de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

  // 2. Préparation des données
  const updates: any = {
    full_name: formData.get('full_name') as string,
  }

  // 3. Gestion de l'image de profil (Avatar)
  const avatarFile = formData.get('avatar') as File
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}` // Nom unique lié à l'utilisateur
    
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile)
    
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      updates.avatar_url = publicUrl
    } else {
      console.error("Erreur upload avatar:", uploadError)
    }
  }

  // 4. Mise à jour dans la table "profiles"
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    console.error("Erreur de mise à jour du profil:", error)
    return { error: "Impossible de mettre à jour le profil." }
  }

  revalidatePath('/seller/dashboard/profile')
  return { success: "Profil mis à jour avec succès !" }
}