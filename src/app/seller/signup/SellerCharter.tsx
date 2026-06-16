'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Charte vendeur — affichée en plein écran avant la création du compte.
 * L'utilisateur DOIT cliquer sur "J'accepte les conditions d'utilisation"
 * pour pouvoir accéder au formulaire d'inscription.
 *
 * Liste des produits interdits sur la marketplace :
 *  - Contenu érotique / pornographique
 *  - Contenu violent
 *  - Tabac, cigarettes, e-cigarettes et produits associés
 *  - Drogue, stupéfiants, substances illicites et accessoires
 *  - Boissons alcoolisées fortes
 *  - Armes (blanches ou à feu) et munitions
 *  - Médicaments soumis à prescription
 *  - Tout produit contrefait ou piraté
 */
export default function SellerCharter({
  onAccepted,
}: {
  onAccepted: () => void
}) {
  const [declined, setDeclined] = useState(false)

  const handleDecline = () => {
    setDeclined(true)
    // Petit délai pour montrer le message d'avertissement avant la redirection
    setTimeout(() => {
      window.location.href = '/'
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* EN-TÊTE */}
      <header className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="font-montserrat font-black uppercase tracking-tighter text-xl sm:text-2xl"
          >
            EDEN MARKET<span className="text-red-600">.</span>
          </Link>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] bg-red-600 text-white px-3 py-1.5">
            Charte vendeur
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* TITRE */}
        <div className="mb-8 md:mb-12">
          <h1 className="font-montserrat font-black text-3xl md:text-5xl uppercase tracking-tight text-black leading-[1.05] mb-4">
            Conditions d'utilisation<br />
            <span className="text-red-600">de la marketplace</span>
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Avant de créer votre boutique sur Eden Flash Market, veuillez lire
            attentivement les règles qui encadrent la vente sur notre plateforme.
            En cliquant sur «&nbsp;J'accepte les conditions d'utilisation&nbsp;»,
            vous reconnaissez avoir pris connaissance de ces règles et vous
            engagez à les respecter.
          </p>
        </div>

        {/* ARTICLE 1 — OBJET */}
        <section className="border-l-4 border-black pl-5 md:pl-6 mb-8">
          <h2 className="font-montserrat font-black text-lg md:text-xl uppercase tracking-tight text-black mb-3">
            1. Objet
          </h2>
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            Eden Flash Market est une marketplace qui met en relation des
            vendeurs (entrepreneurs, commerçants, artisans, entreprises) et des
            acheteurs. La présente charte définit les conditions auxquelles
            tout vendeur s'engage en créant sa boutique sur la plateforme.
          </p>
        </section>

        {/* ARTICLE 2 — PRODUITS STRICTEMENT INTERDITS */}
        <section className="border-l-4 border-red-600 bg-red-50/40 pl-5 md:pl-6 pr-4 py-5 mb-8">
          <h2 className="font-montserrat font-black text-lg md:text-xl uppercase tracking-tight text-black mb-3">
            2. Produits et contenus strictement interdits
          </h2>
          <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
            Par souci de conformité légale, de respect de la dignité humaine
            et de protection de nos consommateurs, la mise en vente des
            produits suivants est formellement interdite sur Eden Flash Market :
          </p>

          <ul className="space-y-3">
            {[
              {
                icon: '🔞',
                title: 'Produits à caractère érotique ou pornographique',
                desc: 'Tout contenu, image, jouet ou support à caractère pornographique ou sexuellement explicite est interdit.',
              },
              {
                icon: '⚔️',
                title: 'Produits violents ou incitant à la violence',
                desc: 'Armes (blanches, à feu, de collection non conforme), munitions, objets conçus pour blesser, contenus faisant l\'apologie de la violence.',
              },
              {
                icon: '🚬',
                title: 'Tabac et produits associés',
                desc: 'Cigarettes, cigares, chichas, e-cigarettes, recharges, accessoires liés au tabac et produits de vapotage.',
              },
              {
                icon: '💊',
                title: 'Drogues et substances illicites',
                desc: 'Stupéfiants, substances psychotropes, produits dopants, accessoires destinés à la consommation ou à la fabrication de drogue.',
              },
              {
                icon: '🍾',
                title: 'Boissons alcoolisées fortes',
                desc: 'Alcools forts, spiritueux et toute boisson alcoolisée titrant plus de 25 % vol. ainsi que leurs accessoires de consommation.',
              },
              {
                icon: '🩺',
                title: 'Médicaments et produits de santé réglementés',
                desc: 'Médicaments soumis à prescription, produits contenant des substances non autorisées, dispositifs médicaux non conformes.',
              },
              {
                icon: '🚫',
                title: 'Produits contrefaits ou piratés',
                desc: 'Contrefaçons, copies illicites, produits piratés, faux documents et tout ce qui porte atteinte à la propriété intellectuelle.',
              },
              {
                icon: '🧨',
                title: 'Substances dangereuses et explosifs',
                desc: 'Explosifs, produits inflammables non conformes, produits chimiques dangereux, feux d\'artifice non autorisés.',
              },
            ].map((it) => (
              <li
                key={it.title}
                className="flex items-start gap-3 bg-white border-2 border-red-600 p-4"
              >
                <span className="text-2xl shrink-0">{it.icon}</span>
                <div>
                  <p className="font-montserrat font-black text-sm md:text-base uppercase tracking-tight text-black">
                    {it.title}
                  </p>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed mt-1">
                    {it.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs md:text-sm text-red-700 font-bold leading-relaxed">
            ⚠️ Toute infraction à cette liste entraîne la suspension immédiate
            de la boutique, la suppression des produits concernés, et le cas
            échéant, le remboursement forcé des commandes en cours, sans
            indemnité.
          </p>
        </section>

        {/* ARTICLE 3 — ENGAGEMENTS DU VENDEUR */}
        <section className="border-l-4 border-black pl-5 md:pl-6 mb-8">
          <h2 className="font-montserrat font-black text-lg md:text-xl uppercase tracking-tight text-black mb-3">
            3. Engagements du vendeur
          </h2>
          <ul className="space-y-2 text-gray-700 text-sm md:text-base leading-relaxed list-disc pl-5">
            <li>Fournir des informations exactes sur son identité et son activité.</li>
            <li>Proposer uniquement des produits licites, conformes et sûrs.</li>
            <li>Respecter les prix affichés et honorer les commandes validées.</li>
            <li>Traiter les acheteurs avec courtoisie et dans le respect de la loi ivoirienne.</li>
            <li>Ne pas usurper l'identité d'une marque ou d'un tiers.</li>
          </ul>
        </section>

        {/* ARTICLE 4 — MODÉRATION */}
        <section className="border-l-4 border-black pl-5 md:pl-6 mb-8">
          <h2 className="font-montserrat font-black text-lg md:text-xl uppercase tracking-tight text-black mb-3">
            4. Modération et sanctions
          </h2>
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            Eden Flash Market se réserve le droit de modérer, retirer ou
            suspendre à tout moment toute annonce, produit ou boutique ne
            respectant pas la présente charte, et ce sans préavis. En cas de
            manquement grave ou répété, le compte vendeur pourra être résilié
            définitivement.
          </p>
        </section>

        {/* ARTICLE 5 — ACCEPTATION */}
        <section className="border-2 border-black bg-gray-50 p-5 md:p-6 mb-8">
          <h2 className="font-montserrat font-black text-lg md:text-xl uppercase tracking-tight text-black mb-3">
            5. Acceptation
          </h2>
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            En cliquant sur le bouton <strong>«&nbsp;J'accepte les conditions d'utilisation&nbsp;»</strong>,
            vous confirmez avoir lu, compris et accepté l'intégralité de la
            présente charte, et vous vous engagez à la respecter.
          </p>
        </section>

        {/* AVERTISSEMENT SI REFUS */}
        {declined && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-600 text-yellow-800 text-sm font-bold">
            ⚠️ Vous avez refusé la charte. Vous allez être redirigé vers l'accueil…
          </div>
        )}

        {/* BOUTONS D'ACTION */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleDecline}
            disabled={declined}
            className="flex-1 py-4 bg-white text-black border-2 border-black font-montserrat font-black uppercase tracking-widest text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Je refuse
          </button>
          <button
            type="button"
            onClick={onAccepted}
            className="flex-1 py-4 bg-red-600 text-white border-2 border-red-600 font-montserrat font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-colors shadow-lg"
          >
            J'accepte les conditions d'utilisation
          </button>
        </div>

        <p className="text-center text-[10px] uppercase tracking-widest text-gray-400 mt-6">
          Eden Flash Market — Marketplace ivoirienne responsable.
        </p>
      </main>
    </div>
  )
}
