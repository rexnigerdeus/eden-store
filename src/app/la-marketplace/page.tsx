import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'La Marketplace | Eden Flash Market',
  description:
    "Découvrez Eden Flash Market : la marketplace ivoirienne qui permet aux entrepreneurs, commerçants et artisans de créer leur boutique en ligne et de vendre leurs produits à grande échelle.",
}

export default function LaMarketplacePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main>
        {/* ====================== HERO ====================== */}
        <section className="relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1728044849321-4cbffc50cc1d?q=80&w=2070&auto=format&fit=crop"
              alt="Marché africain animé"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
          </div>

          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 mb-6 text-[10px] md:text-xs font-montserrat font-black uppercase tracking-[0.25em] bg-red-600 text-white">
                Eden Flash Market
              </span>
              <h1 className="font-montserrat font-black uppercase tracking-tighter text-4xl sm:text-5xl md:text-7xl leading-[0.95] mb-6">
                Votre boutique.<br />
                Votre visibilité.<br />
                <span className="text-red-600">Vos ventes.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed mb-10">
                La marketplace ivoirienne qui permet aux entrepreneurs, commerçants,
                artisans et entreprises de créer facilement leur boutique en ligne
                et de vendre leurs produits à une large audience.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/seller/signup"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-montserrat font-black uppercase tracking-widest transition-colors"
                >
                  Ouvrir ma boutique →
                </Link>
                <Link
                  href="/shops"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-black text-xs sm:text-sm font-montserrat font-black uppercase tracking-widest transition-colors"
                >
                  Découvrir les boutiques
                </Link>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="relative border-t-2 border-red-600 bg-black/80 backdrop-blur">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {[
                { k: '100%', v: 'Ivory Coast First' },
                { k: '24/7', v: 'Boutique en ligne' },
                { k: '0 F', v: 'Pendant 15 jours' },
                { k: '1', v: 'Plateforme unifiée' },
              ].map((s) => (
                <div key={s.v} className="py-6 px-2 md:px-4 text-center">
                  <div className="font-montserrat font-black text-2xl md:text-4xl text-white">{s.k}</div>
                  <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================== À PROPOS ====================== */}
        <section className="py-16 md:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <span className="inline-block text-[10px] md:text-xs font-montserrat font-black uppercase tracking-[0.25em] text-red-600 mb-3">
                À propos
              </span>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl uppercase tracking-tight text-black leading-[1.05] mb-6">
                Le marché, réinventé.
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-5">
                Eden Flash Market est née d'un constat simple : trop de talents
                ivoiriens — entrepreneurs, commerçants, artisans — n'ont pas
                d'espace professionnel pour présenter leur savoir-faire et vendre
                en ligne sans dépendre d'une expertise technique.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                Inspirée du modèle des marketplaces modernes, elle met en relation
                directe vendeurs et acheteurs sur une seule plateforme, pensée
                pour le marché ivoirien et ses réalités : paiement mobile, mobile
                first, logistique locale.
              </p>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1726065235221-78562122baf3?q=80&w=987&auto=format&fit=crop"
                  alt="Vendeuse sur un marché"
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-3 -left-2 bg-red-600 text-white p-6 hidden sm:block max-w-[240px]">
                  <p className="font-montserrat font-black text-3xl leading-none">+1</p>
                  <p className="text-xs uppercase tracking-widest mt-2">Une marketplace 100% ivoirienne</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== POURQUOI NOUS CHOISIR ====================== */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <span className="inline-block text-[10px] md:text-xs font-montserrat font-black uppercase tracking-[0.25em] text-red-600 mb-3">
                Avantages
              </span>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl uppercase tracking-tight text-black leading-[1.05]">
                Pourquoi choisir<br />Eden Flash Market ?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  icon: '⚡',
                  title: 'Boutique en quelques minutes',
                  text: "Mettez vos produits en ligne sans avoir besoin de compétences techniques. Configuration guidée, modèles prêts à l'emploi.",
                  image: 'https://images.unsplash.com/photo-1596484552993-aec4311d3381?q=80&w=2070&auto=format&fit=crop',
                },
                {
                  icon: '👥',
                  title: 'Acheteurs déjà intéressés',
                  text: 'La plateforme rassemble des visiteurs qualifiés, déjà à la recherche de produits et services locaux de qualité.',
                  image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=2072&auto=format&fit=crop',
                },
                {
                  icon: '✨',
                  title: 'Valorisez votre activité',
                  text: 'Présentez votre marque, vos produits et votre savoir-faire dans un espace professionnel et soigné.',
                  image: 'https://images.unsplash.com/photo-1633380246874-e25cd8c2cc9d?q=80&w=2070&auto=format&fit=crop',
                },
                {
                  icon: '💳',
                  title: 'Paiements simplifiés',
                  text: 'Recevez vos commandes et développez votre activité grâce à une solution adaptée au marché ivoirien (Mobile Money).',
                  image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=800&auto=format&fit=crop',
                },
                {
                  icon: '📣',
                  title: 'Visibilité accrue',
                  text: "Profitez des actions de communication, promotions et campagnes mises en place par la marketplace pour booster vos ventes.",
                  image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2006&auto=format&fit=crop',
                },
                {
                  icon: '🤝',
                  title: 'Accompagnement humain',
                  text: "Une équipe locale à votre écoute pour vous aider à démarrer, optimiser vos fiches et développer votre chiffre d'affaires.",
                  image: 'https://images.unsplash.com/photo-1573165662973-4ab3cf3d3508?q=80&w=2069&auto=format&fit=crop',
                },
              ].map((card) => (
                <article
                  key={card.title}
                  className="group bg-white border-2 border-black hover:border-red-600 transition-colors overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-2xl">
                      {card.icon}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-montserrat font-black text-lg md:text-xl uppercase tracking-tight text-black mb-3">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {card.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ====================== COMMENT ÇA MARCHE ====================== */}
        <section className="py-16 md:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative aspect-[4/3] overflow-hidden order-1">
              <img
                src="https://images.unsplash.com/photo-1528123778681-01e39b42808e?q=80&w=2070&auto=format&fit=crop"
                alt="Création d'une boutique en ligne"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
            </div>

            <div className="order-2">
              <span className="inline-block text-[10px] md:text-xs font-montserrat font-black uppercase tracking-[0.25em] text-red-600 mb-3">
                Simple & rapide
              </span>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl uppercase tracking-tight text-black leading-[1.05] mb-8">
                Comment ça marche ?
              </h2>

              <ol className="space-y-6">
                {[
                  {
                    n: '01',
                    t: 'Inscrivez-vous gratuitement',
                    d: "Créez votre compte vendeur en moins de 2 minutes avec votre adresse email.",
                  },
                  {
                    n: '02',
                    t: 'Configurez votre boutique',
                    d: 'Donnez-lui un nom, un logo, une description. Personnalisez sans code.',
                  },
                  {
                    n: '03',
                    t: 'Ajoutez vos produits',
                    d: "Photos, prix, descriptions, stocks. Tout est centralisé en un seul endroit.",
                  },
                  {
                    n: '04',
                    t: 'Vendez et encaissez',
                    d: 'Recevez les commandes, livrez, encaissez. On s\'occupe du reste.',
                  },
                ].map((step) => (
                  <li key={step.n} className="flex gap-5">
                    <span className="flex-shrink-0 w-12 h-12 bg-black text-white font-montserrat font-black text-lg flex items-center justify-center">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-montserrat font-black text-lg uppercase tracking-tight text-black">
                        {step.t}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base mt-1 leading-relaxed">
                        {step.d}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ====================== OFFRE DE LANCEMENT ====================== */}
        <section className="relative bg-black text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop"
              alt="Offre de lancement"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
              <span className="inline-block px-4 py-1.5 mb-5 text-[10px] md:text-xs font-montserrat font-black uppercase tracking-[0.25em] bg-red-600 text-white">
                🎉 Offre de lancement
              </span>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl uppercase tracking-tight leading-[1.05] mb-4">
                Démarrez sans risque.
              </h2>
              <p className="text-gray-300 text-base md:text-lg">
                On vous offre les premiers pas. Le reste, c'est votre talent.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              {/* Offre gratuite */}
              <div className="border-2 border-white p-8 md:p-10 text-center">
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mb-3">
                  Étape 1
                </p>
                <p className="font-montserrat font-black text-5xl md:text-6xl text-white">
                  15<span className="text-2xl align-top ml-1">jours</span>
                </p>
                <p className="text-base md:text-lg mt-2 text-gray-200">d'utilisation gratuite</p>
                <p className="text-sm text-gray-400 mt-6 leading-relaxed">
                  Dès la création de votre boutique, profitez de toutes les
                  fonctionnalités sans frais pendant 15 jours.
                </p>
              </div>

              {/* Offre payante */}
              <div className="border-2 border-red-600 bg-red-600 p-8 md:p-10 text-center relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-red-600 text-[10px] font-montserrat font-black uppercase tracking-widest px-3 py-1">
                  Populaire
                </span>
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-white/80 mb-3">
                  Étape 2
                </p>
                <p className="font-montserrat font-black text-5xl md:text-6xl text-white">
                  10 000<span className="text-2xl ml-1">FCFA</span>
                </p>
                <p className="text-base md:text-lg mt-2 text-white">seulement / mois</p>
                <p className="text-sm text-white/80 mt-6 leading-relaxed">
                  Après la période d'essai, votre boutique reste accessible à
                  partir de 10 000 FCFA. Un tarif pensé pour booster les entrepreneurs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== NOTRE VISION ====================== */}
        <section className="py-16 md:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-center">
            <div className="md:col-span-3 order-2 md:order-1">
              <span className="inline-block text-[10px] md:text-xs font-montserrat font-black uppercase tracking-[0.25em] text-red-600 mb-3">
                Notre vision
              </span>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl uppercase tracking-tight text-black leading-[1.05] mb-6">
                Plus qu'un marché.<br />
                <span className="text-red-600">Un mouvement.</span>
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                Faire d'Eden Flash Market la plateforme de référence qui met en
                lumière les entrepreneurs, commerçants et entreprises — en
                particulier les entrepreneurs chrétiens — tout en offrant aux
                consommateurs un espace fiable pour acheter des produits de
                qualité.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                Nous croyons qu'un marché local fort, numérique et accessible,
                peut transformer l'économie réelle des familles et des
                communautés en Côte d'Ivoire.
              </p>
            </div>
            <div className="md:col-span-2 order-1 md:order-2">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
                  alt="Communauté d'entrepreneurs"
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-600 hidden md:block" />
                <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-black hidden md:block" />
              </div>
            </div>
          </div>
        </section>

        {/* ====================== CHIFFRES ====================== */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {[
                { k: '500+', v: 'Boutiques cibles année 1' },
                { k: '10 000', v: 'Visiteurs uniques / mois' },
                { k: '100%', v: 'Paiement mobile' },
                { k: '24/7', v: 'Support vendeur' },
              ].map((s) => (
                <div key={s.v} className="border-2 border-black bg-white p-6">
                  <div className="font-montserrat font-black text-3xl md:text-5xl text-black">{s.k}</div>
                  <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-600 mt-2">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================== TÉMOIGNAGES / CONFIANCE ====================== */}
        <section className="py-16 md:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span className="inline-block text-[10px] md:text-xs font-montserrat font-black uppercase tracking-[0.25em] text-red-600 mb-3">
              Ils nous font confiance
            </span>
            <h2 className="font-montserrat font-black text-3xl md:text-5xl uppercase tracking-tight text-black leading-[1.05]">
              La parole aux vendeurs.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                name: 'Awa K.',
                role: 'Créatrice de bijoux — Abidjan',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
                quote:
                  "En 10 minutes ma boutique était en ligne. Aujourd'hui je vends dans tout le pays.",
              },
              {
                name: 'Moussa D.',
                role: 'Commerçant — Bouaké',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
                quote:
                  "Le paiement Mobile Money a tout changé. Mes clients paient en un clic.",
              },
              {
                name: 'Estelle B.',
                role: 'Artisane — Grand-Bassam',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
                quote:
                  "Je n'avais aucune compétence technique. L'équipe m'a accompagnée du début.",
              },
            ].map((t) => (
              <figure
                key={t.name}
                className="bg-white border-2 border-black p-6 md:p-8 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-black"
                  />
                  <div>
                    <figcaption className="font-montserrat font-black text-sm uppercase tracking-tight">
                      {t.name}
                    </figcaption>
                    <p className="text-[11px] uppercase tracking-widest text-gray-500">
                      {t.role}
                    </p>
                  </div>
                </div>
                <blockquote className="text-gray-800 text-sm md:text-base leading-relaxed flex-1">
                  « {t.quote} »
                </blockquote>
                <div className="mt-4 text-red-600 text-sm">★★★★★</div>
              </figure>
            ))}
          </div>
        </section>

        {/* ====================== FAQ ====================== */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-14">
              <span className="inline-block text-[10px] md:text-xs font-montserrat font-black uppercase tracking-[0.25em] text-red-600 mb-3">
                Questions fréquentes
              </span>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl uppercase tracking-tight text-black leading-[1.05]">
                On vous répond.
              </h2>
            </div>

            <div className="space-y-3 md:space-y-4">
              {[
                {
                  q: 'Faut-il des compétences techniques pour ouvrir ma boutique ?',
                  a: "Non. Eden Flash Market est conçue pour être simple : configuration guidée, modèles prêts à l'emploi, accompagnement humain.",
                },
                {
                  q: 'Combien coûte la boutique après les 15 jours gratuits ?',
                  a: "À partir de 10 000 FCFA. Un tarif volontairement accessible pour soutenir les entrepreneurs ivoiriens.",
                },
                {
                  q: 'Quels moyens de paiement sont acceptés ?',
                  a: "Mobile Money (Orange Money, MTN Mobile Money, Wave) et paiement à la livraison via nos partenaires logistiques.",
                },
                {
                  q: 'Puis-je vendre des produits et des services ?',
                  a: "Oui. La plateforme accueille les produits physiques, les créations artisanales, les services et le prêt-à-porter.",
                },
                {
                  q: 'Comment se passe la livraison ?',
                  a: "Vous pouvez livrer vous-même ou utiliser notre réseau de partenaires logistiques couvrant Abidjan et plusieurs villes.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group bg-white border-2 border-black [&[open]]:border-red-600 transition-colors"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between p-5 md:p-6">
                    <span className="font-montserrat font-black text-sm md:text-base uppercase tracking-tight pr-4">
                      {item.q}
                    </span>
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center group-open:rotate-45 transition-transform text-lg leading-none">
                      +
                    </span>
                  </summary>
                  <div className="px-5 md:px-6 pb-5 md:pb-6 text-gray-700 text-sm md:text-base leading-relaxed border-t-2 border-black/10 pt-4">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ====================== CTA FINAL ====================== */}
        <section className="relative bg-black text-white py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1556742400-b5b7c5121f5f?q=80&w=2000&auto=format&fit=crop"
              alt="Ouvrir ma boutique"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/60" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-montserrat font-black text-4xl md:text-6xl uppercase tracking-tighter leading-[0.95] mb-6">
              Prêt à lancer<br />
              <span className="text-red-600">votre boutique ?</span>
            </h2>
            <p className="text-gray-300 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Rejoignez les entrepreneurs qui font grandir leur activité avec
              Eden Flash Market. 15 jours gratuits, sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/seller/signup"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-montserrat font-black uppercase tracking-widest transition-colors"
              >
                Ouvrir ma boutique gratuitement
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 border-2 border-white hover:bg-white hover:text-black text-white text-xs sm:text-sm font-montserrat font-black uppercase tracking-widest transition-colors"
              >
                Explorer la marketplace
              </Link>
            </div>
            <p className="mt-8 text-xs uppercase tracking-widest text-gray-400">
              Eden Flash Market — Votre boutique, votre visibilité, vos ventes.
            </p>
          </div>
        </section>
      </main>

      {/* ====================== FOOTER SIMPLE ====================== */}
      <footer className="bg-black text-white border-t-2 border-red-600">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-montserrat font-black uppercase tracking-tight text-lg">
            EDEN MARKET<span className="text-red-600">.</span>
          </p>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            © {new Date().getFullYear()} Eden Flash Market — Made by <a href="https://www.influencemood.com" className="underline hover:text-red-600 transition-colors">INFLUENCE MOOD ♥️</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
