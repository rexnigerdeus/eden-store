'use client'

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

/**
 * Seuils et paramètres de compression vidéo.
 *
 * On compresse uniquement les fichiers > COMPRESSION_THRESHOLD_BYTES
 * pour ne pas gaspiller le CPU sur des vidéos déjà petites.
 * La cible est ~6 Mbps en H.264 (qualité visuelle "visually lossless"
 * pour une démo produit de 15 s en 720p/1080p).
 */
export const COMPRESSION_THRESHOLD_BYTES = 25 * 1024 * 1024 // 25 Mo
export const COMPRESSION_TARGET_BITRATE = '6M'              // ~6 Mbps
export const COMPRESSION_CRF = 28                          // 18-28 = bon compromis
export const COMPRESSION_MAX_HEIGHT = 720                   // 720p pour démo produit
export const COMPRESSION_TIMEOUT_MS = 90 * 1000            // 90 s max

/**
 * URLs du "core" wasm ffmpeg — on les charge depuis un CDN
 * pour éviter d'alourdir le bundle Next.js (~30 Mo).
 *
 * Si tu veux auto-héberger le core, copie les fichiers de
 *   node_modules/@ffmpeg/core/dist/umd/
 * dans /public/ffmpeg/ et remplace BASE_URL par '/ffmpeg'.
 */
const FFMPEG_CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
const FFMPEG_CORE_URL = `${FFMPEG_CORE_BASE}/ffmpeg-core.js`
const FFMPEG_CORE_WASM_URL = `${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`

export interface CompressionResult {
  /** Fichier final (compressé ou original si pas de compression) */
  file: File
  /** true si on a effectivement compressé */
  compressed: boolean
  /** Taille avant, en octets */
  originalSize: number
  /** Taille après, en octets */
  finalSize: number
  /** Durée de la compression en ms (0 si pas de compression) */
  durationMs: number
  /** Message d'erreur si la compression a échoué (on retombe alors sur l'original) */
  warning?: string
}

export interface CompressionProgress {
  /** 0..1 */
  ratio: number
  /** Étape humaine */
  message: string
}

let ffmpegInstance: FFmpeg | null = null
let ffmpegLoadingPromise: Promise<FFmpeg> | null = null

/**
 * Charge (ou retourne) l'instance FFmpeg singleton.
 * Le core wasm (~30 Mo) n'est téléchargé qu'une seule fois par session.
 */
const getFFmpeg = async (onProgress?: (ratio: number) => void): Promise<FFmpeg> => {
  if (ffmpegInstance) return ffmpegInstance
  if (ffmpegLoadingPromise) return ffmpegLoadingPromise

  const ffmpeg = new FFmpeg()

  ffmpeg.on('log', ({ message }) => {
    // Logs verbeux de ffmpeg — utiles pour le debug, bruyants en prod.
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ffmpeg]', message)
    }
  })
  ffmpeg.on('progress', ({ progress }) => {
    // progress = 0..1, mais ffmpeg.wasm peut renvoyer > 1 ou NaN par moments.
    const safe = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
    onProgress?.(safe)
  })

  ffmpegLoadingPromise = (async () => {
    await ffmpeg.load({
      coreURL: await toBlobURL(FFMPEG_CORE_URL, 'text/javascript'),
      wasmURL: await toBlobURL(FFMPEG_CORE_WASM_URL, 'application/wasm'),
    })
    ffmpegInstance = ffmpeg
    return ffmpeg
  })()

  return ffmpegLoadingPromise
}

/**
 * Compresse une vidéo côté client avec ffmpeg.wasm.
 *
 * Stratégie :
 *  - Vidéo déjà <= 25 Mo → on renvoie l'original telle quelle (gain de CPU)
 *  - Sinon : réencodage en H.264, AAC, 720p max, CRF 28, bitrate cible 6 Mbps
 *  - En cas d'échec (codec non supporté, timeout) : on renvoie l'original
 *    avec un warning, on ne bloque jamais l'utilisateur.
 *
 * @param file     Fichier vidéo source
 * @param onProgress  Callback optionnel pour l'UI de progression
 * @returns        CompressionResult (toujours un File valide)
 */
export const compressVideo = async (
  file: File,
  onProgress?: (p: CompressionProgress) => void
): Promise<CompressionResult> => {
  const start = performance.now()
  const originalSize = file.size

  // Garde-fou : pas de compression si le fichier est déjà petit
  if (file.size <= COMPRESSION_THRESHOLD_BYTES) {
    return {
      file,
      compressed: false,
      originalSize,
      finalSize: file.size,
      durationMs: 0,
    }
  }

  // Garde-fou : si le fichier dépasse la limite finale (50 Mo côté serveur)
  // on tente quand même de compresser, mais on prévient l'utilisateur.
  // (Le serveur rejettera à 50 Mo si la compression échoue.)

  onProgress?.({ ratio: 0.02, message: 'Initialisation du moteur vidéo…' })

  let ffmpeg: FFmpeg
  try {
    ffmpeg = await getFFmpeg((p) =>
      onProgress?.({ ratio: 0.05 + p * 0.85, message: 'Compression en cours…' })
    )
  } catch (err) {
    console.warn('[video-compress] FFmpeg init failed, returning original', err)
    return {
      file,
      compressed: false,
      originalSize,
      finalSize: file.size,
      durationMs: 0,
      warning: "Le moteur de compression n'a pas pu démarrer, fichier envoyé tel quel.",
    }
  }

  // Écriture du fichier d'entrée dans le FS virtuel de ffmpeg
  onProgress?.({ ratio: 0.05, message: 'Lecture de la vidéo…' })

  const inputName = 'input' + getExtension(file.name)
  const outputName = 'output.mp4'

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file))
  } catch (err) {
    console.warn('[video-compress] writeFile failed', err)
    return {
      file,
      compressed: false,
      originalSize,
      finalSize: file.size,
      durationMs: 0,
      warning: 'Impossible de lire la vidéo en mémoire.',
    }
  }

  // Encodage : H.264 (libx264) + AAC, max 720p, CRF 28, bitrate cible 6 Mbps
  // -movflags +faststart : place le moov atom en tête → lecture progressive
  // -an : on garde l'audio tel quel (ou le retire si absent)
  // -t 20 : filet de sécurité, on coupe à 20 s max (limite métier : 15 s)
  onProgress?.({ ratio: 0.1, message: 'Compression en cours…' })

  const encodePromise = ffmpeg.exec([
    '-i', inputName,
    '-t', '20',
    '-vf', `scale='min(${COMPRESSION_MAX_HEIGHT},ih)':-2`,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', String(COMPRESSION_CRF),
    '-b:v', COMPRESSION_TARGET_BITRATE,
    '-maxrate', COMPRESSION_TARGET_BITRATE,
    '-bufsize', '12M',
    '-c:a', 'aac',
    '-b:a', '96k',
    '-movflags', '+faststart',
    '-y',
    outputName,
  ])

  const timeoutPromise = new Promise<number>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), COMPRESSION_TIMEOUT_MS)
  )

  let exitCode: number
  try {
    exitCode = await Promise.race([encodePromise, timeoutPromise])
  } catch (err) {
    console.warn('[video-compress] encode failed or timed out', err)
    // Nettoyage et repli sur l'original
    await safeUnlink(ffmpeg, inputName)
    return {
      file,
      compressed: false,
      originalSize,
      finalSize: file.size,
      durationMs: performance.now() - start,
      warning: "La compression a pris trop de temps, fichier envoyé tel quel.",
    }
  }

  if (exitCode !== 0) {
    console.warn('[video-compress] non-zero exit code', exitCode)
    await safeUnlink(ffmpeg, inputName)
    return {
      file,
      compressed: false,
      originalSize,
      finalSize: file.size,
      durationMs: performance.now() - start,
      warning: "Le format vidéo n'est pas supporté par le compresseur, fichier envoyé tel quel.",
    }
  }

  // Lecture du fichier de sortie
  onProgress?.({ ratio: 0.95, message: 'Finalisation…' })

  const data = await ffmpeg.readFile(outputName) as Uint8Array
  // Copie dans un nouveau buffer pour garantir un ArrayBuffer (et non SharedArrayBuffer),
  // requis par le type BlobPart depuis TypeScript 5.7+.
  const bytes = new Uint8Array(data)
  const blob = new Blob([bytes], { type: 'video/mp4' })

  // Nettoyage du FS virtuel
  await safeUnlink(ffmpeg, inputName)
  await safeUnlink(ffmpeg, outputName)

  // On garde le nom de fichier d'origine (le serveur utilise un UUID, pas le nom)
  const compressedFile = new File([blob], renameToMp4(file.name), {
    type: 'video/mp4',
    lastModified: Date.now(),
  })

  onProgress?.({ ratio: 1, message: 'Terminé !' })

  return {
    file: compressedFile,
    compressed: true,
    originalSize,
    finalSize: compressedFile.size,
    durationMs: performance.now() - start,
  }
}

const getExtension = (filename: string): string => {
  const i = filename.lastIndexOf('.')
  return i >= 0 ? filename.slice(i) : '.mp4'
}

const renameToMp4 = (filename: string): string => {
  const i = filename.lastIndexOf('.')
  return (i >= 0 ? filename.slice(0, i) : filename) + '.mp4'
}

const safeUnlink = async (ffmpeg: FFmpeg, name: string): Promise<void> => {
  try { await ffmpeg.deleteFile(name) } catch { /* ignore */ }
}

/**
 * Formate des octets en chaîne lisible (ex: "12.4 Mo").
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}
