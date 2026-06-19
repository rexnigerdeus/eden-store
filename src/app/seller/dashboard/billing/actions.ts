'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Validation de la preuve de paiement (capture d'écran) ---
//
// On accepte un large éventail de types d'images pour éviter les frictions :
// JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF, HEIC/HEIF (iPhone), ICO.
// Taille max : 8 Mo (les captures d'écran sont en général < 5 Mo).
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
}

const MAX_PROOF_SIZE = 8 * 1024 * 1024
const PROOF_BUCKET = 'shop-assets'

const sanitizeExt = (ext: string) => ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'

const resolveImageExt = (file: File): string => {
  const fromMime = file.type && EXT_BY_MIME[file.type.toLowerCase()]
  if (fromMime) return fromMime
  const fromName = sanitizeExt(file.name.split('.').pop() || '')
  if (fromName && fromName !== 'bin') return fromName
  return 'bin'
}

export async function notifyPaymentMade(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Utilisateur non connecté." }

  // 1. La preuve de paiement est désormais OBLIGATOIRE pour notifier un paiement.
  // Cela protège l'admin contre les fausses notifications et accélère la vérification.
  const proofFile = formData.get('payment_proof') as File | null
  if (!proofFile || proofFile.size === 0) {
    return { error: "Merci de joindre la capture d'écran de votre paiement (Wave / Orange Money)." }
  }

  const mime = (proofFile.type || '').toLowerCase()
  if (mime && !ALLOWED_IMAGE_MIME.has(mime)) {
    return { error: `Format de capture d'écran non supporté (${mime || 'inconnu'}). Formats acceptés : JPG, PNG, WebP, HEIC, etc.` }
  }
  if (proofFile.size > MAX_PROOF_SIZE) {
    return { error: `Capture d'écran trop volumineuse (${(proofFile.size / 1024 / 1024).toFixed(1)} Mo). Maximum : 8 Mo.` }
  }

  // 2. Upload dans le bucket `shop-assets` (déjà utilisé pour logos/banners).
  // On stocke sous : <userId>/payment-proof-<uuid>.<ext>
  const fileExt = resolveImageExt(proofFile)
  const fileName = `${user.id}/payment-proof-${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(fileName, proofFile, { upsert: false, contentType: proofFile.type || `image/${fileExt}` })

  if (uploadError) {
    console.error('[payment-proof-upload]', uploadError)
    return { error: `Erreur lors de l'envoi de la capture : ${uploadError.message}` }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(PROOF_BUCKET)
    .getPublicUrl(fileName)

  // 3. On met à jour le statut de la boutique + on stocke l'URL de la preuve
  // pour que l'admin puisse la consulter depuis son dashboard.
  const { error } = await supabase
    .from('shops')
    .update({
      subscription_status: 'pending_verification',
      payment_proof_url: publicUrl,
    })
    .eq('seller_id', user.id)

  if (error) {
    console.error('Erreur lors de la notification:', error)
    return { error: "Impossible d'enregistrer votre demande. Réessayez." }
  }

  revalidatePath('/seller/dashboard/billing')
  return { success: "Preuve de paiement envoyée ! Nous vérifions votre transfert sous 24h." }
}
