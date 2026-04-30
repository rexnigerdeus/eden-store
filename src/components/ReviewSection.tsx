'use client'

import { useState } from 'react'
import { submitReview } from '@/app/actions/reviewActions'

interface ReviewSectionProps {
  productId: string
  shopId: string
  canReview: boolean // Déterminé par le serveur
  reviews: any[]
}

export default function ReviewSection({ productId, shopId, canReview, reviews }: ReviewSectionProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Calcul de la moyenne
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await submitReview(productId, shopId, rating, comment)

    if (result.success) {
      setShowForm(false)
      alert("Merci ! Votre avis a été publié avec succès.")
    } else {
      alert(result.error)
    }
    setIsSubmitting(false)
  }

  // Fonction pour dessiner les étoiles
  const renderStars = (note: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`text-xl ${i < Math.round(note) ? 'text-yellow-400' : 'text-gray-200'}`}>
        ★
      </span>
    ))
  }

  return (
    <div className="mt-16 pt-10 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avis Clients</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex">{renderStars(Number(averageRating))}</div>
            <span className="text-gray-600 font-medium">{averageRating} sur 5 ({reviews.length} avis)</span>
          </div>
        </div>

        {canReview && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-walmart-darkBlue text-white font-bold rounded-xl hover:bg-blue-900 transition-colors"
          >
            Écrire un avis
          </button>
        )}
      </div>

      {/* Formulaire d'avis */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-10 animate-fade-in">
          <h3 className="font-bold text-gray-900 mb-4">Notez ce produit</h3>
          
          <div className="flex gap-2 mb-6 cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-4xl hover:scale-110 transition-transform ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">Votre commentaire (optionnel)</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full p-4 border border-gray-300 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-walmart-blue text-gray-900 bg-white"
            placeholder="Qu'avez-vous pensé de cet article ?"
          />

          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-walmart-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Envoi...' : 'Publier mon avis'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="px-6 py-2 text-gray-500 hover:bg-gray-200 font-medium rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste des avis */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">Aucun avis pour le moment. Soyez le premier à donner votre opinion !</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-sm font-medium text-gray-900 ml-2">{review.profiles?.full_name || 'Client vérifié'}</span>
                <span className="text-xs text-gray-400 ml-auto">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              {review.comment && (
                <p className="text-gray-700 mt-2">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}