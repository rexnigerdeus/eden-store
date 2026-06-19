'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ============================================================
//  CONSTANTES : large prise en charge des formats de média
// ============================================================
//
// On accepte un large éventail de formats (JPEG, PNG, WebP, HEIC, etc.
// pour les images ; MP4, MOV, WebM, 3GP, AVI pour la vidéo) afin d'éviter
// les frictions pour les vendeurs dont les smartphones ou les reflex
// produisent des fichiers aux formats variés.

const ALLOWED_IMAGE_MIME = new Set<string>([
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
])

const ALLOWED_VIDEO_MIME = new Set<string>([
  'video/mp4',
  'video/quicktime',     // .mov (iPhone)
  'video/webm',
  'video/x-matroska',    // .mkv
  'video/3gpp',          // .3gp (téléphones bas de gamme)
  'video/3gpp2',
  'video/x-msvideo',     // .avi
  'video/mpeg',
  'video/ogg',
])

const EXT_BY_IMAGE_MIME: Record<string, string> = {
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
}

const EXT_BY_VIDEO_MIME: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-matroska': 'mkv',
  'video/3gpp': '3gp',
  'video/3gpp2': '3g2',
  'video/x-msvideo': 'avi',
  'video/mpeg': 'mpeg',
  'video/ogg': 'ogv',
}

const MAX_IMAGE_SIZE = 8 * 1024 * 1024   // 8 Mo
const MAX_VIDEO_SIZE = 50 * 1024 * 1024  // 50 Mo (vidéo 15 s)
const PRODUCT_BUCKET = 'product-images'

const sanitizeExt = (ext: string) => ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'

const resolveImageExt = (file: File): string => {
  const fromMime = file.type && EXT_BY_IMAGE_MIME[file.type.toLowerCase()]
  if (fromMime) return fromMime
  const fromName = sanitizeExt(file.name.split('.').pop() || '')
  if (fromName && fromName !== 'bin') return fromName
  return 'bin'
}

const resolveVideoExt = (file: File): string => {
  const fromMime = file.type && EXT_BY_VIDEO_MIME[file.type.toLowerCase()]
  if (fromMime) return fromMime
  const fromName = sanitizeExt(file.name.split('.').pop() || '')
  if (fromName && fromName !== 'bin') return fromName
  return 'mp4'
}

interface UploadResult {
  url: string | null
  error: string | null
}

const uploadMedia = async (
  supabase: any,
  file: File,
  kind: 'image' | 'video',
  productId: string,
  suffix: string
): Promise<UploadResult> => {
  if (!file || file.size === 0) return { url: null, error: null }

  const mime = (file.type || '').toLowerCase()
  const allowed = kind === 'image' ? ALLOWED_IMAGE_MIME : ALLOWED_VIDEO_MIME
  const maxSize = kind === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE

  if (mime && !allowed.has(mime)) {
    return { url: null, error: `Le fichier "${file.name}" a un format non supporté (${mime || 'inconnu'}).` }
  }
  if (file.size > maxSize) {
    return { url: null, error: `Le fichier "${file.name}" est trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : ${maxSize / 1024 / 1024} Mo.` }
  }

  const ext = kind === 'image' ? resolveImageExt(file) : resolveVideoExt(file)
  const fileName = `${productId}/${suffix}-${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(fileName, file, { upsert: false, contentType: file.type || (kind === 'image' ? `image/${ext}` : `video/${ext}`) })

  if (uploadError) {
    console.error(`[product-${suffix}-upload]`, uploadError)
    return { url: null, error: `Erreur lors de l'upload de ${suffix} : ${uploadError.message}` }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(PRODUCT_BUCKET)
    .getPublicUrl(fileName)

  return { url: publicUrl, error: null }
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  // 1. Vérification de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

  // 2. Extraction des données textuelles
  const title = (formData.get('title') as string | null)?.trim() || ''
  const description = (formData.get('description') as string | null)?.trim() || ''
  const priceStr = formData.get('price') as string | null
  const category_id = (formData.get('category_id') as string | null) || null

  if (!title) return redirect('/seller/dashboard/products/new?message=Le nom de l\'article est requis.')
  if (!description) return redirect('/seller/dashboard/products/new?message=La description est requise.')
  const price = parseFloat(priceStr || '')
  if (!isFinite(price) || price < 0) return redirect('/seller/dashboard/products/new?message=Prix invalide.')

  // 3. Engagement de conformité (case obligatoire côté serveur aussi)
  const complianceAccepted = formData.get('media_compliance_accepted') === 'true'
  if (!complianceAccepted) {
    return redirect('/seller/dashboard/products/new?message=Vous devez certifier la conformité des médias avec l\'article réel.')
  }

  // 4. Gestion de la boutique par défaut
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

  // 5. On insère d'abord le produit pour avoir un identifiant stable
  // (utilisé comme préfixe dans le bucket pour bien ranger les médias).
  const { data: inserted, error: insertError } = await supabase
    .from('products')
    .insert({
      shop_id: shop!.id,
      title,
      description,
      price,
      category_id,
      // On initialise les URLs à null, on les met à jour juste après les uploads
      cover_image_url: null,
      real_image_url: null,
      video_url: null,
      media_compliance_accepted: true,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error("Erreur d'insertion:", insertError)
    return redirect('/seller/dashboard/products/new?message=Erreur lors de la création du produit')
  }

  const productId = inserted.id as string

  // 6. Upload des 3 médias
  //    - cover_image : photo de couverture mise en avant
  //    - real_image  : photo réelle (exigence de conformité)
  //    - video       : vidéo de démonstration (≤ 15 s)
  const coverFile = formData.get('cover_image') as File | null
  const realFile = formData.get('real_image') as File | null
  const videoFile = formData.get('video') as File | null

  // 6.a) Couverture (obligatoire)
  if (!coverFile || coverFile.size === 0) {
    // On supprime le produit qu'on vient de créer pour ne pas laisser de brouillon
    await supabase.from('products').delete().eq('id', productId)
    return redirect('/seller/dashboard/products/new?message=La photo de couverture est obligatoire.')
  }
  const coverRes = await uploadMedia(supabase, coverFile, 'image', productId, 'cover')
  if (coverRes.error) {
    await supabase.from('products').delete().eq('id', productId)
    return redirect(`/seller/dashboard/products/new?message=${encodeURIComponent(coverRes.error)}`)
  }

  // 6.b) Photo réelle (obligatoire)
  if (!realFile || realFile.size === 0) {
    await supabase.from('products').delete().eq('id', productId)
    return redirect('/seller/dashboard/products/new?message=La photo réelle de l\'article est obligatoire.')
  }
  const realRes = await uploadMedia(supabase, realFile, 'image', productId, 'real')
  if (realRes.error) {
    await supabase.from('products').delete().eq('id', productId)
    return redirect(`/seller/dashboard/products/new?message=${encodeURIComponent(realRes.error)}`)
  }

  // 6.c) Vidéo (obligatoire)
  if (!videoFile || videoFile.size === 0) {
    await supabase.from('products').delete().eq('id', productId)
    return redirect('/seller/dashboard/products/new?message=La vidéo de démonstration (15 s) est obligatoire.')
  }
  const videoRes = await uploadMedia(supabase, videoFile, 'video', productId, 'video')
  if (videoRes.error) {
    await supabase.from('products').delete().eq('id', productId)
    return redirect(`/seller/dashboard/products/new?message=${encodeURIComponent(videoRes.error)}`)
  }

  // 7. Mise à jour finale du produit avec toutes les URLs
  const { error: updateError } = await supabase
    .from('products')
    .update({
      cover_image_url: coverRes.url,
      real_image_url: realRes.url,
      video_url: videoRes.url,
    })
    .eq('id', productId)

  if (updateError) {
    console.error('Erreur mise à jour médias produit:', updateError)
    return redirect('/seller/dashboard/products/new?message=Produit créé mais erreur lors de l\'enregistrement des médias.')
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