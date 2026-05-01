'use client'

import { useState, useEffect } from 'react'
import { updateShopSettings } from './actions'

export default function ShopForm({ shop }: { shop: any }) {
  const [isPending, setIsPending] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [isCopied, setIsCopied] = useState(false)
  const [shopUrl, setShopUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && shop?.slug) {
      setShopUrl(`${window.location.origin}/shop/${shop.slug}`)
    }
  }, [shop])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shopUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Erreur lors de la copie : ", err)
    }
  }

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    const result = await updateShopSettings(formData)
    setIsPending(false)
    
    if (result?.error) {
      setErrorMessage(result.error)
    } else if (result?.success) {
      setSuccessMessage(result.success)
      setTimeout(() => setSuccessMessage(''), 4000)
      
      // Si on vient de créer la boutique, l'URL complète de la page pourrait devoir changer plus tard,
      // mais le rafraîchissement côté serveur de Next.js s'occupera d'apporter le shop complet au prochain re-render.
    }
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      
      {/* N'AFFICHER CETTE SECTION QUE SI LA BOUTIQUE EXISTE DÉJÀ (shop?.slug) */}
      {shop?.slug && (
        <section className="bg-walmart-light border border-blue-100 p-4 sm:p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full">
            <h3 className="text-base sm:text-lg font-medium text-walmart-darkBlue">Lien public de votre vitrine</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Partagez ce lien avec vos clients pour qu'ils puissent découvrir votre univers et vos produits.</p>
            <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-walmart-blue font-medium mt-2 inline-block hover:underline truncate">
              {shopUrl}
            </a>
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            className={`w-full md:w-auto px-5 py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap ${
              isCopied 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-white text-walmart-darkBlue border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {isCopied ? '✓ Lien copié !' : '🔗 Copier le lien'}
          </button>
        </section>
      )}

      {/* --- FORMULAIRE PRINCIPAL --- */}
      <form action={onSubmit} className="space-y-8 sm:space-y-10">
        
        {/* Messages de succès ou d'erreur */}
        {successMessage && (
          <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center shadow-sm transition-all duration-300">
            <span className="text-green-500 mr-3 text-lg sm:text-xl">✓</span>
            <p className="text-green-700 font-medium text-sm sm:text-base">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center shadow-sm transition-all duration-300">
            <span className="text-red-500 mr-3 text-lg sm:text-xl">⚠️</span>
            <p className="text-red-700 font-medium text-sm sm:text-base">{errorMessage}</p>
          </div>
        )}

        {/* 1. IDENTITÉ VISUELLE */}
        <section>
          <h3 className="text-base sm:text-lg font-medium text-walmart-darkBlue border-b border-gray-100 pb-2 mb-4">
            1. Identité visuelle
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">Logo de la boutique (Optionnel)</label>
              <input id="logo" name="logo" type="file" accept="image/*" className="w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-walmart-light file:text-walmart-blue hover:file:bg-blue-100" />
              {shop?.logo_url && <p className="text-xs text-green-600 mt-1">Un logo est déjà en ligne.</p>}
            </div>
            <div>
              <label htmlFor="banner" className="block text-sm font-medium text-gray-700 mb-1">Bannière de couverture (Optionnel)</label>
              <input id="banner" name="banner" type="file" accept="image/*" className="w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-walmart-light file:text-walmart-blue hover:file:bg-blue-100" />
              {shop?.banner_url && <p className="text-xs text-green-600 mt-1">Une bannière est déjà en ligne.</p>}
            </div>
          </div>
        </section>

        {/* 2. INFORMATIONS GÉNÉRALES */}
        <section>
          <h3 className="text-base sm:text-lg font-medium text-walmart-darkBlue border-b border-gray-100 pb-2 mb-4">
            2. Informations générales
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique <span className="text-red-500">*</span></label>
                <input id="name" name="name" type="text" required defaultValue={shop?.name || ''} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none" />
              </div>
              <div>
                <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-1">Expertise / Slogan (Optionnel)</label>
                <input id="expertise" name="expertise" type="text" defaultValue={shop?.expertise || ''} placeholder="Ex: Créateur de mode éco-responsable" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
              <textarea id="description" name="description" rows={3} defaultValue={shop?.description || ''} placeholder="Résumez votre activité en quelques phrases..." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none resize-none" />
            </div>
          </div>
        </section>

        {/* 3. L'HISTOIRE & LES VALEURS */}
        <section>
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-medium text-walmart-darkBlue border-b border-gray-100 pb-2">
              3. Votre Univers (Mini-Site)
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Donnez envie aux clients de vous soutenir en racontant votre histoire.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Biographie du vendeur</label>
              <textarea id="bio" name="bio" rows={4} defaultValue={shop?.bio || ''} placeholder="Qui êtes-vous ? Qu'est-ce qui vous passionne ?" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none resize-none"></textarea>
            </div>
            <div>
              <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-1">Histoire de la boutique</label>
              <textarea id="story" name="story" rows={4} defaultValue={shop?.story || ''} placeholder="Comment a commencé votre projet ?" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none resize-none"></textarea>
            </div>
          </div>

          <div>
            <label htmlFor="values" className="block text-sm font-medium text-gray-700 mb-1">Nos Valeurs / Qualité</label>
            <textarea id="values" name="values" rows={3} defaultValue={shop?.values || ''} placeholder="Ex: Produits 100% bio, artisanat local, commerce équitable..." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none resize-none"></textarea>
          </div>
        </section>

        {/* 4. CONFIANCE & LIVRAISON */}
        <section>
          <h3 className="text-base sm:text-lg font-medium text-walmart-darkBlue border-b border-gray-100 pb-2 mb-4">
            4. Confiance & Livraison
          </h3>
          <div className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="delivery_locations" className="block text-sm font-medium text-gray-700 mb-1">Lieux de livraison couverts</label>
              <input id="delivery_locations" name="delivery_locations" type="text" defaultValue={shop?.delivery_locations || ''} placeholder="Ex: Abidjan, Bouaké..." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="return_policy" className="block text-sm font-medium text-gray-700 mb-1">Politique de retour (Brève)</label>
                <textarea id="return_policy" name="return_policy" rows={3} defaultValue={shop?.return_policy || ''} placeholder="Ex: Retours acceptés sous 3 jours." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none resize-none" />
              </div>
              <div>
                <label htmlFor="policies" className="block text-sm font-medium text-gray-700 mb-1">Garanties & Conditions détaillées</label>
                <textarea id="policies" name="policies" rows={3} defaultValue={shop?.policies || ''} placeholder="Ex: Satisfait ou remboursé, SAV disponible 7j/7..." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none resize-none" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. CONTACT & RÉSEAUX */}
        <section>
          <h3 className="text-base sm:text-lg font-medium text-walmart-darkBlue border-b border-gray-100 pb-2 mb-4">
            5. Contact & Réseaux Sociaux
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input id="whatsapp" name="whatsapp" type="text" defaultValue={shop?.whatsapp || ''} placeholder="+225..." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none" />
            </div>
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">Lien Instagram</label>
              <input id="instagram" name="instagram" type="url" defaultValue={shop?.instagram || ''} placeholder="https://instagram.com/..." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">Lien Facebook</label>
              <input id="facebook" name="facebook" type="url" defaultValue={shop?.facebook || ''} placeholder="https://facebook.com/..." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div>
              <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">Lien TikTok</label>
              <input id="tiktok" name="tiktok" type="url" defaultValue={shop?.tiktok || ''} placeholder="https://tiktok.com/@..." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none" />
            </div>
          </div>
        </section>

        {/* BOUTON SAUVEGARDER */}
        <div className="sticky bottom-4 z-10 flex items-center justify-center sm:justify-end bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200 shadow-lg mt-6 sm:mt-8">
          <button type="submit" disabled={isPending} className={`w-full sm:w-auto px-8 py-3 font-semibold rounded-lg transition-colors shadow-sm text-white text-sm sm:text-base ${isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-walmart-blue hover:bg-blue-700'}`}>
            {isPending ? 'Action en cours...' : (shop?.slug ? 'Enregistrer ma vitrine' : 'Créer ma boutique')}
          </button>
        </div>
        
      </form>
    </div>
  )
}