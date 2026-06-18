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

  // Liste blanche des types MIME acceptés pour le logo / la bannière.
  // On accepte un large éventail (JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF,
  // HEIC/HEIF venant d'iPhone, ICO, et SVG). Le `accept` du formulaire est
  // un simple indice pour l'UI, mais c'est la validation côté serveur qui
  // fait foi — c'est elle qui corrige définitivement les bugs d'upload
  // que l'on observait avec certains types d'images.
  const ALLOWED_MIME_TYPES = new Set<string>([
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/x-bmp',
    'image/tiff',
    'image/avif',
    'image/heic',
    'image/heif',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/svg+xml',
  ])

  // Table de correspondance MIME -> extension de fichier normalisée.
  // Supabase Storage valide l'extension ; on s'assure donc qu'elle
  // correspond bien à un format connu, même si le navigateur envoie
  // un nom de fichier sans extension ou avec une extension inventée.
  const EXT_BY_MIME: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/pjpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/x-bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/avif': 'avif',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
    'image/svg+xml': 'svg',
  }

  // Taille maximale : 8 Mo. Au-delà, Supabase Storage peut rejeter
  // l'upload ou la requête Next.js peut expirer.
  const MAX_FILE_SIZE = 8 * 1024 * 1024

  const SHOP_BUCKET = 'shop-assets'

  const sanitizeExt = (ext: string) => ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'

  // Résout l'extension finale à utiliser pour un fichier donné, en
  // privilégiant le type MIME réel du fichier (source de vérité) puis
  // l'extension du nom de fichier, en retombant sur `bin` en dernier
  // recours. On évite ainsi les échecs d'upload causés par des noms
  // de fichiers exotiques ou absents.
  const resolveExtension = (file: File): string => {
    const fromMime = file.type && EXT_BY_MIME[file.type.toLowerCase()]
    if (fromMime) return fromMime
    const fromName = sanitizeExt(file.name.split('.').pop() || '')
    if (fromName && fromName !== 'bin') return fromName
    return 'bin'
  }

  const validateImage = (file: File, label: string) => {
    const mime = (file.type || '').toLowerCase()
    // 1. Type MIME autorisé
    if (mime && !ALLOWED_MIME_TYPES.has(mime)) {
      return `Le fichier "${label}" a un format non pris en charge (${mime || 'inconnu'}). Formats acceptés : JPG, PNG, WebP, GIF, BMP, TIFF, AVIF, HEIC, HEIF, ICO, SVG.`
    }
    // 2. Taille maximale
    if (file.size > MAX_FILE_SIZE) {
      return `Le fichier "${label}" est trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Taille maximale : 8 Mo.`
    }
    return null
  }

  const logoFile = formData.get('logo') as File
  if (logoFile && logoFile.size > 0) {
    const validationError = validateImage(logoFile, 'logo')
    if (validationError) return { error: validationError }

    const fileExt = resolveExtension(logoFile)
    const fileName = `${user.id}/logo-${crypto.randomUUID()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from(SHOP_BUCKET)
      .upload(fileName, logoFile, { upsert: false, contentType: logoFile.type || `image/${fileExt}` })
    if (uploadError) {
      console.error('[shop-logo-upload]', uploadError)
      return { error: `Erreur lors de l'upload du logo : ${uploadError.message}` }
    }
    const { data: { publicUrl: logoUrl } } = supabase.storage.from(SHOP_BUCKET).getPublicUrl(fileName)
    updates.logo_url = logoUrl
  }

  const bannerFile = formData.get('banner') as File
  if (bannerFile && bannerFile.size > 0) {
    const validationError = validateImage(bannerFile, 'bannière')
    if (validationError) return { error: validationError }

    const fileExt = resolveExtension(bannerFile)
    const fileName = `${user.id}/banner-${crypto.randomUUID()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from(SHOP_BUCKET)
      .upload(fileName, bannerFile, { upsert: false, contentType: bannerFile.type || `image/${fileExt}` })
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