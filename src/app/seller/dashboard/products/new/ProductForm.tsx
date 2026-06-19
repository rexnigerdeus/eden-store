'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '../actions'
import { compressVideo, formatBytes, COMPRESSION_THRESHOLD_BYTES, type CompressionProgress } from '@/utils/videoCompressor'

interface Category {
  id: string
  name: string
}

export default function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // États de progression / UI
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null)

  // Aperçu de la vidéo sélectionnée (pour feedback avant compression)
  const [videoPreview, setVideoPreview] = useState<{
    name: string
    size: number
    needsCompression: boolean
    compressedSize?: number
  } | null>(null)

  const inputClasses = "w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors"
  const labelClasses = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"

  // Lorsqu'on choisit une vidéo, on calcule si on aura besoin de la compresser
  // (juste pour l'aperçu, la compression réelle se fait au submit).
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setVideoPreview(null)
      return
    }
    setVideoPreview({
      name: file.name,
      size: file.size,
      needsCompression: file.size > COMPRESSION_THRESHOLD_BYTES,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setErrorMessage('')
    setIsSubmitting(true)
    setCompressionProgress(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const originalVideo = formData.get('video') as File | null

    try {
      let videoToUpload: File | null = originalVideo

      // Compression client-side si la vidéo dépasse le seuil
      if (originalVideo && originalVideo.size > 0 && originalVideo.size > COMPRESSION_THRESHOLD_BYTES) {
        try {
          const result = await compressVideo(originalVideo, (p) => {
            setCompressionProgress(p)
          })

          if (result.compressed) {
            // On remplace le fichier vidéo dans le FormData par la version compressée
            formData.set('video', result.file, result.file.name)
            videoToUpload = result.file
            setVideoPreview({
              name: result.file.name,
              size: result.file.size,
              needsCompression: false,
              compressedSize: result.file.size,
            })
          } else if (result.warning) {
            // Échec de compression : on continue avec l'original, mais on prévient
            console.warn('[compression]', result.warning)
          }
        } catch (err) {
          // En cas d'erreur inattendue, on continue avec l'original
          console.warn('[compression] unexpected error, sending original', err)
        }
      }

      // Si la vidéo finale dépasse encore 50 Mo, on bloque
      if (videoToUpload && videoToUpload.size > 50 * 1024 * 1024) {
        setErrorMessage(
          `La vidéo fait ${formatBytes(videoToUpload.size)}, ce qui dépasse la limite de 50 Mo même après compression. ` +
          'Essayez avec une vidéo plus courte ou en résolution inférieure.'
        )
        setIsSubmitting(false)
        setCompressionProgress(null)
        return
      }

      setCompressionProgress({ ratio: 1, message: 'Envoi au serveur…' })

      // Appel direct de la Server Action.
      // La Server Action gère la validation, l'upload et la redirection
      // vers /seller/dashboard/products en cas de succès.
      // En cas d'erreur, elle redirige vers ?message=... (qu'on affichera après).
      await createProduct(formData)

      // Si on arrive ici, c'est que la Server Action n'a pas redirigé → succès
      // (en réalité, redirect() lance une exception spéciale NEXT_REDIRECT
      // qui est capturée par le framework, donc on ne devrait jamais atteindre
      // cette ligne. Mais on la garde par sécurité.)
      router.push('/seller/dashboard/products')
    } catch (err: any) {
      // Les exceptions NEXT_REDIRECT sont normales (utilisées par redirect())
      // → on ne les affiche pas, on laisse Next.js faire son travail.
      if (err?.digest?.startsWith?.('NEXT_REDIRECT')) {
        // redirection en cours, ne rien faire
        return
      }
      console.error('[submit]', err)
      setErrorMessage("Erreur réseau lors de l'envoi. Réessayez.")
      setIsSubmitting(false)
      setCompressionProgress(null)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="bg-gray-50 border-2 border-black p-6 md:p-10 space-y-8"
    >
      {/* Message d'erreur éventuel */}
      {errorMessage && (
        <div className="p-4 border-2 border-red-600 bg-red-50 text-xs font-bold uppercase tracking-widest text-red-700">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label htmlFor="title" className={labelClasses}>Nom de l'article *</label>
          <input id="title" name="title" type="text" required placeholder="T-shirt Noir Oversize" className={inputClasses} />
        </div>

        <div>
          <label htmlFor="category_id" className={labelClasses}>Catégorie *</label>
          <select id="category_id" name="category_id" required className={`${inputClasses} appearance-none cursor-pointer`}>
            <option value="">Sélectionner...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="price" className={labelClasses}>Prix de vente (FCFA) *</label>
        <input id="price" name="price" type="number" min="0" step="1" required placeholder="15000" className={inputClasses} />
      </div>

      <div>
        <label htmlFor="description" className={labelClasses}>Description détaillée *</label>
        <textarea id="description" name="description" rows={5} required placeholder="Coupe, matière, détails..." className={`${inputClasses} resize-none`} />
      </div>

      {/* === SECTION MÉDIAS OBLIGATOIRES (Conformité produit) === */}
      <div className="border-t-2 border-black pt-8 space-y-6">
        <div>
          <h3 className="text-lg font-montserrat font-black text-black uppercase tracking-widest">
            Médias du produit (obligatoires)
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2 leading-relaxed">
            Pour garantir la confiance des clients, EDEN MARKET exige 3 médias :
            une <strong>photo de couverture</strong>, une <strong>photo réelle</strong> de l'article,
            et une <strong>vidéo de 15 secondes</strong> montrant l'article sous toutes ses coutures.
          </p>
        </div>

        {/* 1. Photo de couverture */}
        <div>
          <label htmlFor="cover_image" className={labelClasses}>
            1. Photo de couverture (mise en avant) *
          </label>
          <input
            id="cover_image"
            name="cover_image"
            type="file"
            required
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif,image/heic,image/heif"
            className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:text-xs file:font-bold file:uppercase file:tracking-widest cursor-pointer hover:file:bg-gray-900 p-2`}
          />
          <p className="text-[10px] text-gray-500 mt-2">
            Formats : JPG, PNG, WebP, HEIC (iPhone), etc. Taille max : 8 Mo.
          </p>
        </div>

        {/* 2. Photo réelle */}
        <div>
          <label htmlFor="real_image" className={labelClasses}>
            2. Photo réelle de l'article *
          </label>
          <input
            id="real_image"
            name="real_image"
            type="file"
            required
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif,image/heic,image/heif"
            className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:text-xs file:font-bold file:uppercase file:tracking-widest cursor-pointer hover:file:bg-gray-900 p-2`}
          />
          <p className="text-[10px] text-gray-500 mt-2">
            Photo non retouchée de l'article réel (pas de photo de catalogue / fournisseur). Formats : JPG, PNG, WebP, HEIC, etc. Taille max : 8 Mo.
          </p>
        </div>

        {/* 3. Vidéo 15s — avec compression auto côté client */}
        <div>
          <label htmlFor="video" className={labelClasses}>
            3. Vidéo de démonstration (15 secondes) *
          </label>
          <input
            id="video"
            name="video"
            type="file"
            required
            accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/3gpp,video/x-msvideo"
            onChange={handleVideoChange}
            className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:text-xs file:font-bold file:uppercase file:tracking-widest cursor-pointer hover:file:bg-gray-900 p-2`}
          />

          {/* Aperçu intelligent de la vidéo */}
          {videoPreview && (
            <div className="mt-3 p-3 border-2 border-gray-200 bg-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
                📹 {videoPreview.name} — {formatBytes(videoPreview.size)}
              </p>
              {videoPreview.needsCompression && !videoPreview.compressedSize && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mt-1">
                  ⚡ Cette vidéo sera automatiquement compressée dans votre navigateur avant l'envoi
                  (économie de bande passante + rapidité).
                </p>
              )}
              {videoPreview.compressedSize && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mt-1">
                  ✓ Compressée : {formatBytes(videoPreview.size)} (économie de bande passante)
                </p>
              )}
            </div>
          )}

          <p className="text-[10px] text-gray-500 mt-2">
            Vidéo réelle de 15 s maximum montrant l'article (tenue en main, porté, etc.).
            Formats : MP4, MOV (iPhone), WebM, 3GP, AVI. Taille max : 50 Mo
            (les vidéos &gt; 25 Mo sont compressées automatiquement avant l'envoi).
          </p>
        </div>
      </div>

      {/* === ENGAGEMENT DE CONFORMITÉ === */}
      <div className="border-t-2 border-black pt-8">
        <label className="flex items-start gap-4 cursor-pointer group">
          <input
            type="checkbox"
            name="media_compliance_accepted"
            required
            value="true"
            className="mt-1 w-6 h-6 shrink-0 accent-black border-2 border-black cursor-pointer"
          />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black leading-relaxed">
            Je certifie que les images et la vidéo fournies représentent <strong>fidèlement l'article réel</strong> que je livrerai au client.
            Je comprends qu'en cas de non-conformité avérée, mon compte vendeur pourra être suspendu
            et que cette charte protège la confiance des clients d'EDEN MARKET.
          </span>
        </label>
      </div>

      <div className="border-t border-gray-300 pt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full md:w-auto px-10 py-4 text-sm font-montserrat font-black uppercase tracking-widest transition-all border-2 border-black ${
            isSubmitting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'
          }`}
        >
          {isSubmitting ? 'Traitement en cours…' : 'Enregistrer dans l\'inventaire'}
        </button>
      </div>

      {/* Barre de progression compression / upload */}
      {compressionProgress && isSubmitting && (
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black">
              {compressionProgress.message}
            </span>
            <span className="text-[10px] font-mono font-black text-black">
              {Math.round(compressionProgress.ratio * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 border border-black overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-200"
              style={{ width: `${Math.round(compressionProgress.ratio * 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-gray-500 italic">
            La compression vidéo s'exécute dans votre navigateur — ne fermez pas cette page.
          </p>
        </div>
      )}
    </form>
  )
}
