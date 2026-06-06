'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateShopSettings(formData: FormData) {
  const supabase = await createClient()

  // 1. Vérification de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

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

  Object.keys(updates).forEach(key => updates[key] == null && delete updates[key])

  // 3. Upload des images
  // NOTE: les logos / bannières des boutiques sont stockés dans le bucket
  // "shop-assets" (le bucket "shops" n'existe pas dans le projet Supabase).
  // NOTE: n'utiliser que [A-Za-z0-9-_] dans le nom de fichier.
  // `Math.random()` produit "0.4829..." qui contient un point, ce que
  // Supabase Storage interprète comme un séparateur d'extension et fait
  // échouer l'upload. On utilise crypto.randomUUID() à la place.
  const sanitizeExt = (ext: string) => ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const SHOP_BUCKET = 'shop-assets'

  const logoFile = formData.get('logo') as File
  if (logoFile && logoFile.size > 0) {
    const fileExt = sanitizeExt(logoFile.name.split('.').pop() || '')
    const fileName = `${user.id}/logo-${crypto.randomUUID()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from(SHOP_BUCKET).upload(fileName, logoFile, { upsert: false })
    if (uploadError) {
      console.error('[shop-logo-upload]', uploadError)
      return { error: `Erreur lors de l'upload du logo : ${uploadError.message}` }
    }
    const { data: { publicUrl: logoUrl } } = supabase.storage.from(SHOP_BUCKET).getPublicUrl(fileName)
    updates.logo_url = logoUrl
  }

  const bannerFile = formData.get('banner') as File
  if (bannerFile && bannerFile.size > 0) {
    const fileExt = sanitizeExt(bannerFile.name.split('.').pop() || '')
    const fileName = `${user.id}/banner-${crypto.randomUUID()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from(SHOP_BUCKET).upload(fileName, bannerFile, { upsert: false })
    if (uploadError) {
      console.error('[shop-banner-upload]', uploadError)
      return { error: `Erreur lors de l'upload de la bannière : ${uploadError.message}` }
    }
    const { data: { publicUrl: bannerUrl } } = supabase.storage.from(SHOP_BUCKET).getPublicUrl(fileName)
    updates.banner_url = bannerUrl
  }

  const { data: existingShop } = await supabase.from('shops').select('id').eq('seller_id', user.id).maybeSingle()

  if (existingShop) {
    // MISE À JOUR
    const { error } = await supabase.from('shops').update(updates).eq('seller_id', user.id)
    if (error) return { error: "Impossible de mettre à jour la boutique." }
  } else {
    // CRÉATION AVEC 14 JOURS D'ESSAI
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14)

    const { error } = await supabase.from('shops').insert({
      ...updates,
      seller_id: user.id,
      slug: slug,
      subscription_status: 'active',
      subscription_tier: 'standard',
      subscription_end_date: trialEndDate.toISOString()
    })

    if (error) return { error: "Impossible de créer la boutique. Ce nom est peut-être déjà pris." }
  }

  revalidatePath('/seller/dashboard/settings')
  return { success: "Boutique enregistrée avec succès !" }
}