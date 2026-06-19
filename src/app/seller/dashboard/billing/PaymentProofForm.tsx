'use client'

import { useState, useRef } from 'react'
import { notifyPaymentMade } from './actions'

export default function PaymentProofForm() {
  const [isPending, setIsPending] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fileName, setFileName] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    setSuccessMessage('')
    setErrorMessage('')

    const result = await notifyPaymentMade(formData)
    setIsPending(false)

    if (result?.error) {
      setErrorMessage(result.error)
    } else if (result?.success) {
      setSuccessMessage(result.success)
      // On vide le formulaire après succès
      formRef.current?.reset()
      setFileName('')
      setTimeout(() => setSuccessMessage(''), 6000)
    }
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-6">

      {/* Messages succès / erreur */}
      {successMessage && (
        <div className="p-4 border-2 border-green-600 bg-green-50 text-xs font-bold uppercase tracking-widest text-green-700">
          ✓ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-4 border-2 border-red-600 bg-red-50 text-xs font-bold uppercase tracking-widest text-red-700">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Upload de la preuve */}
      <div>
        <label htmlFor="payment_proof" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
          Capture d'écran du paiement *
        </label>
        <input
          id="payment_proof"
          name="payment_proof"
          type="file"
          required
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif,image/heic,image/heif,image/x-icon"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
          className="w-full p-3 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:text-xs file:font-bold file:uppercase file:tracking-widest cursor-pointer hover:file:bg-gray-900"
        />
        {fileName && (
          <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-2">
            ✓ Fichier sélectionné : {fileName}
          </p>
        )}
        <p className="text-[10px] text-gray-500 mt-2">
          Formats acceptés : JPG, PNG, WebP, HEIC (iPhone), etc. Taille max : 8 Mo.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full py-5 font-montserrat font-black uppercase tracking-widest text-sm transition-all border-2 border-black ${
          isPending
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-900'
        }`}
      >
        {isPending ? 'Envoi en cours...' : "J'ai effectué mon transfert Mobile Money"}
      </button>
    </form>
  )
}
