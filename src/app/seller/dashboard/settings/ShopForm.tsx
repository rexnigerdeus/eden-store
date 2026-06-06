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
    }
  }

  // --- CLASSES CSS RÉUTILISABLES (Design Brut / Streetwear) ---
  const inputClasses = "w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors rounded-none"
  const labelClasses = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
  const sectionTitleClasses = "text-lg font-montserrat font-black text-black uppercase tracking-widest mb-6"

  return (
    <div className="space-y-10 pb-10">
      
      {/* SECTION : PARTAGER MA BOUTIQUE (Visible si boutique existe) */}
      {shop?.slug && (
        <section className="bg-gray-50 border-2 border-black p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full">
            <h3 className="text-sm font-montserrat font-black uppercase tracking-widest text-black mb-1">Lien public de votre vitrine</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Partagez ce lien avec vos clients sur les réseaux.</p>
            <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-black hover:underline truncate bg-white px-3 py-1 border border-gray-300 inline-block">
              {shopUrl}
            </a>
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            className={`w-full md:w-auto px-6 py-4 text-xs font-montserrat font-black uppercase tracking-widest transition-colors border-2 shrink-0 ${
              isCopied 
                ? 'bg-green-600 border-green-600 text-white' 
                : 'bg-black border-black text-white hover:bg-gray-900'
            }`}
          >
            {isCopied ? '✓ Lien copié' : 'Copier le lien'}
          </button>
        </section>
      )}

      {/* --- FORMULAIRE PRINCIPAL --- */}
      <form action={onSubmit} className="space-y-12">
        
        {/* Messages de succès ou d'erreur */}
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

        {/* 1. IDENTITÉ VISUELLE */}
        <section className="border-t border-gray-200 pt-8">
          <h3 className={sectionTitleClasses}>1. Identité visuelle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="logo" className={labelClasses}>Logo de la boutique (Optionnel)</label>
              <input id="logo" name="logo" type="file" accept="image/*" className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:text-xs file:font-bold file:uppercase file:tracking-widest cursor-pointer hover:file:bg-gray-900 p-2`} />
              {shop?.logo_url && <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-2">✓ Logo en ligne</p>}
            </div>
            <div>
              <label htmlFor="banner" className={labelClasses}>Bannière de couverture (Optionnel)</label>
              <input id="banner" name="banner" type="file" accept="image/*" className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:text-xs file:font-bold file:uppercase file:tracking-widest cursor-pointer hover:file:bg-gray-900 p-2`} />
              {shop?.banner_url && <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-2">✓ Bannière en ligne</p>}
            </div>
          </div>
        </section>

        {/* 2. INFORMATIONS GÉNÉRALES */}
        <section className="border-t border-gray-200 pt-8">
          <h3 className={sectionTitleClasses}>2. Informations générales</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="name" className={labelClasses}>Nom de la boutique *</label>
                <input id="name" name="name" type="text" required defaultValue={shop?.name || ''} className={inputClasses} placeholder="Ex: EDEN store Store" />
              </div>
              <div>
                <label htmlFor="expertise" className={labelClasses}>Expertise / Slogan (Optionnel)</label>
                <input id="expertise" name="expertise" type="text" defaultValue={shop?.expertise || ''} placeholder="Ex: Streetwear & Accessoires" className={inputClasses} />
              </div>
            </div>
            <div>
              <label htmlFor="description" className={labelClasses}>Description courte</label>
              <textarea id="description" name="description" rows={3} defaultValue={shop?.description || ''} placeholder="Résumez votre activité..." className={`${inputClasses} resize-none`} />
            </div>
          </div>
        </section>

        {/* 3. L'HISTOIRE & LES VALEURS */}
        <section className="border-t border-gray-200 pt-8">
          <div className="mb-6">
            <h3 className={sectionTitleClasses}>3. Votre Univers (Mini-Site)</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Donnez envie aux clients de vous soutenir en racontant votre histoire.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <label htmlFor="bio" className={labelClasses}>Biographie du vendeur</label>
              <textarea id="bio" name="bio" rows={4} defaultValue={shop?.bio || ''} placeholder="Qui êtes-vous ?" className={`${inputClasses} resize-none`}></textarea>
            </div>
            <div>
              <label htmlFor="story" className={labelClasses}>Histoire de la boutique</label>
              <textarea id="story" name="story" rows={4} defaultValue={shop?.story || ''} placeholder="Comment a commencé votre projet ?" className={`${inputClasses} resize-none`}></textarea>
            </div>
          </div>

          <div>
            <label htmlFor="values" className={labelClasses}>Nos Valeurs / Qualité</label>
            <textarea id="values" name="values" rows={3} defaultValue={shop?.values || ''} placeholder="Ex: Produits durables, artisanat..." className={`${inputClasses} resize-none`}></textarea>
          </div>
        </section>

        {/* 4. CONFIANCE & LIVRAISON */}
        <section className="border-t border-gray-200 pt-8">
          <h3 className={sectionTitleClasses}>4. Confiance & Livraison</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="delivery_locations" className={labelClasses}>Lieux de livraison couverts</label>
              <input id="delivery_locations" name="delivery_locations" type="text" defaultValue={shop?.delivery_locations || ''} placeholder="Ex: Abidjan, Bouaké..." className={inputClasses} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="return_policy" className={labelClasses}>Politique de retour (Brève)</label>
                <textarea id="return_policy" name="return_policy" rows={3} defaultValue={shop?.return_policy || ''} placeholder="Ex: Retours acceptés sous 3 jours." className={`${inputClasses} resize-none`} />
              </div>
              <div>
                <label htmlFor="policies" className={labelClasses}>Garanties & Conditions détaillées</label>
                <textarea id="policies" name="policies" rows={3} defaultValue={shop?.policies || ''} placeholder="Ex: Satisfait ou remboursé..." className={`${inputClasses} resize-none`} />
              </div>
            </div>
          </div>
        </section>

        {/* 5. CONTACT & RÉSEAUX */}
        <section className="border-t border-gray-200 pt-8">
          <h3 className={sectionTitleClasses}>5. Contact & Réseaux Sociaux</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="whatsapp" className={labelClasses}>WhatsApp</label>
              <input id="whatsapp" name="whatsapp" type="text" defaultValue={shop?.whatsapp || ''} placeholder="+225..." className={inputClasses} />
            </div>
            <div>
              <label htmlFor="instagram" className={labelClasses}>Lien Instagram</label>
              <input id="instagram" name="instagram" type="url" defaultValue={shop?.instagram || ''} placeholder="https://instagram.com/..." className={inputClasses} />
            </div>
            <div>
              <label htmlFor="facebook" className={labelClasses}>Lien Facebook</label>
              <input id="facebook" name="facebook" type="url" defaultValue={shop?.facebook || ''} placeholder="https://facebook.com/..." className={inputClasses} />
            </div>
            <div>
              <label htmlFor="tiktok" className={labelClasses}>Lien TikTok</label>
              <input id="tiktok" name="tiktok" type="url" defaultValue={shop?.tiktok || ''} placeholder="https://tiktok.com/@..." className={inputClasses} />
            </div>
          </div>
        </section>

        {/* BOUTON SAUVEGARDER (Sticky et massif) */}
        <div className="sticky bottom-0 z-10 bg-white border-t-2 border-black pt-6 pb-6 mt-8">
          <button 
            type="submit" 
            disabled={isPending} 
            className={`w-full py-5 font-montserrat font-black uppercase tracking-widest text-sm transition-all border-2 border-black ${
              isPending ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900 shadow-xl'
            }`}
          >
            {isPending ? 'Action en cours...' : (shop?.slug ? 'Enregistrer ma vitrine' : 'Créer ma boutique')}
          </button>
        </div>
        
      </form>
    </div>
  )
}