import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-walmart-blue selection:text-white pb-0">
      
      {/* 1. NAVIGATION */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-walmart-darkBlue tracking-tight">EDEN store</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-50 text-walmart-blue text-xs font-bold uppercase tracking-wider">Marketplace</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-walmart-blue transition-colors">
              Connexion
            </Link>
            <Link href="/seller/signup" className="px-4 py-2 sm:px-6 sm:py-2.5 bg-walmart-darkBlue text-white text-sm sm:text-base font-bold rounded-full hover:bg-blue-900 transition-all shadow-sm">
              Créer ma boutique
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative bg-white pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            
            {/* Texte de l'accroche */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6 sm:mb-8">
                Consommez avec sens. <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-walmart-blue to-blue-800">
                  Entreprenez avec impact.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                La première marketplace dédiée à la communauté chrétienne. Soutenez les activités de vos frères et sœurs, ou ouvrez votre propre vitrine professionnelle en quelques clics.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
                <Link href="/marketplace" className="w-full sm:w-auto px-8 py-4 bg-walmart-blue text-white rounded-full font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-center">
                  Explorer le catalogue
                </Link>
                <Link href="/seller/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-walmart-darkBlue border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-sm text-center">
                  Vendre sur EDEN store
                </Link>
              </div>
            </div>

            {/* Illustration CSS (Mockup Hero) */}
            <div className="lg:w-1/2 relative w-full h-[400px] md:h-[500px] hidden md:block">
              {/* Cercle de fond */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-50 rounded-full blur-3xl opacity-60"></div>
              
              {/* Carte Produit Flottante */}
              <div className="absolute top-10 right-10 lg:right-20 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.07)] p-4 border border-gray-100 z-10 transform rotate-3 animate-pulse" style={{ animationDuration: '4s' }}>
                <div className="w-full h-40 bg-gray-100 rounded-2xl mb-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm text-sm">❤️</div>
                </div>
                <div className="h-4 w-3/4 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-100 rounded-full mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-walmart-darkBlue rounded-full"></div>
                  <div className="h-8 w-8 bg-walmart-blue rounded-full"></div>
                </div>
              </div>

              {/* Notification Commande */}
              <div className="absolute bottom-20 left-10 lg:left-0 bg-white rounded-2xl shadow-[0_15px_40px_rgb(0,0,0,0.08)] p-4 border border-gray-100 z-20 flex items-center gap-4 transform -rotate-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">🛒</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Nouvelle commande !</p>
                  <p className="text-xs text-gray-500">Il y a 2 minutes • Abidjan</p>
                </div>
              </div>

              {/* Badge Vendeur Vérifié */}
              <div className="absolute top-1/2 left-20 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 border border-gray-100 z-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-bold text-gray-700">Vendeur Vérifié</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. NOTRE VISION */}
      <section className="py-16 md:py-24 bg-walmart-darkBlue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">🤝</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Bâtissons une économie solidaire</h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light">
            Notre vision va au-delà du simple commerce. EDEN store est un outil conçu pour donner de la force et de la croissance aux entreprises qui partagent nos valeurs. En achetant ici, vous investissez directement dans le talent de notre communauté.
          </p>
        </div>
      </section>

      {/* 4. AVANTAGES ACHETEURS (Avec Mockup Marketplace) */}
      <section className="py-20 md:py-32 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            
            <div className="lg:w-1/2">
              <span className="text-walmart-blue font-bold tracking-wider uppercase text-sm mb-4 block">Espace Client</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Des achats qui ont <br/> du sens.
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Trouvez des produits de qualité tout en soutenant l'économie locale. Profitez d'une expérience de navigation fluide et sécurisée.
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-walmart-blue flex items-center justify-center text-lg">🌱</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Croissance mutuelle</h4>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">Chaque franc dépensé est un soutien direct à l'indépendance financière des projets de la communauté.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-lg">⭐</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Valeurs partagées</h4>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">Achetez en toute confiance auprès de vendeurs qui partagent votre éthique et votre intégrité.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-lg">🔒</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Sécurité & Transparence</h4>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">Profils vérifiés, avis authentiques et paiement sécurisé à la livraison ou en ligne.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Illustration CSS (Mockup Marketplace Mobile) */}
            <div className="lg:w-1/2 relative w-full flex justify-center">
              <div className="w-[320px] bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-gray-100 p-4 relative overflow-hidden">
                {/* Header Mobile Mock */}
                <div className="flex justify-between items-center mb-6 pt-2">
                  <div className="h-4 w-16 bg-gray-800 rounded-full"></div>
                  <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                </div>
                {/* Search Bar Mock */}
                <div className="w-full h-10 bg-gray-100 rounded-full mb-6 flex items-center px-4">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div className="h-2 w-24 bg-gray-200 rounded-full ml-3"></div>
                </div>
                {/* Categories Mock */}
                <div className="flex gap-2 mb-6 overflow-hidden">
                  <div className="h-8 w-20 bg-walmart-darkBlue rounded-full flex-shrink-0"></div>
                  <div className="h-8 w-16 bg-gray-100 rounded-full flex-shrink-0"></div>
                  <div className="h-8 w-24 bg-gray-100 rounded-full flex-shrink-0"></div>
                </div>
                {/* Grid Mock */}
                <div className="grid grid-cols-2 gap-3 pb-8">
                  <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                    <div className="w-full h-28 bg-gray-100 rounded-xl mb-3"></div>
                    <div className="h-2 w-3/4 bg-gray-300 rounded-full mb-2"></div>
                    <div className="h-3 w-1/2 bg-walmart-darkBlue rounded-full"></div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                    <div className="w-full h-28 bg-blue-50 rounded-xl mb-3 relative">
                      <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="h-2 w-full bg-gray-300 rounded-full mb-2"></div>
                    <div className="h-3 w-2/3 bg-walmart-darkBlue rounded-full"></div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                    <div className="w-full h-28 bg-yellow-50 rounded-xl mb-3"></div>
                    <div className="h-2 w-1/2 bg-gray-300 rounded-full mb-2"></div>
                    <div className="h-3 w-1/3 bg-walmart-darkBlue rounded-full"></div>
                  </div>
                </div>
                {/* Fade out bottom */}
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. AVANTAGES VENDEURS (Avec Mockup Dashboard) */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="text-walmart-blue font-bold tracking-wider uppercase text-sm mb-4 block">Espace Vendeur Pro</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Digitalisez votre business pour <br/>
                <span className="text-walmart-blue">5 000 FCFA / mois</span>.
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Sans commissions cachées sur vos ventes. Nous vous fournissons tous les outils dignes des plus grandes plateformes pour gérer et faire grandir votre activité 24h/24 et 7j/7.
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-1">✓</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Un mini-site dédié</h4>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">Votre propre lien (EDEN store.com/shop/vous) avec votre histoire, vos bannières et vos conditions.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-1">✓</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Gestion complète des commandes</h4>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">Un tableau de bord intuitif pour suivre vos ventes, vos stocks et vos revenus en temps réel.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-1">✓</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Chat & WhatsApp intégrés</h4>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">Communiquez facilement avec vos clients depuis la plateforme ou directement sur WhatsApp.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Illustration CSS (Mockup Dashboard Vendeur) */}
            <div className="lg:w-1/2 relative w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-blue-50/30 rounded-[2rem] transform translate-x-4 translate-y-4 -z-10 border border-gray-100"></div>
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8">
                {/* Header Mock */}
                <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                  <div className="h-3 w-32 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-walmart-darkBlue rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">V</div>
                </div>
                {/* Stats Grid Mock */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">💰</div>
                    <div className="h-2 w-16 bg-gray-200 rounded-full mb-3"></div>
                    <div className="h-4 w-24 bg-walmart-darkBlue rounded-full"></div>
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3">📦</div>
                    <div className="h-2 w-20 bg-gray-200 rounded-full mb-3"></div>
                    <div className="h-4 w-12 bg-walmart-darkBlue rounded-full"></div>
                  </div>
                </div>
                {/* List Mock */}
                <div className="space-y-3">
                  <div className="h-14 w-full bg-blue-50/50 rounded-xl border border-blue-100 flex items-center px-4 gap-4">
                    <div className="w-8 h-8 bg-white rounded-full"></div>
                    <div className="h-2 w-1/3 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="h-14 w-full bg-gray-50/50 rounded-xl border border-gray-100 flex items-center px-4 gap-4">
                    <div className="w-8 h-8 bg-white border border-gray-100 rounded-full"></div>
                    <div className="h-2 w-1/4 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-14 w-full bg-gray-50/50 rounded-xl border border-gray-100 flex items-center px-4 gap-4">
                    <div className="w-8 h-8 bg-white border border-gray-100 rounded-full"></div>
                    <div className="h-2 w-2/5 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMMENT ÇA MARCHE (Les Étapes) */}
      <section className="py-20 md:py-32 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Commencez à vendre aujourd'hui</h2>
            <p className="text-gray-500 mt-4 text-lg">Trois étapes simples pour lancer votre activité en ligne.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-[2px] bg-gray-200 -z-10"></div>

            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-white border-[6px] border-gray-50 shadow-sm rounded-3xl flex items-center justify-center text-xl font-bold text-walmart-blue mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Inscrivez-vous</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Créez votre compte vendeur en moins de 2 minutes de manière entièrement sécurisée.</p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-white border-[6px] border-gray-50 shadow-sm rounded-3xl flex items-center justify-center text-xl font-bold text-walmart-blue mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Configurez la vitrine</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Personnalisez votre mini-site, racontez votre histoire et ajoutez vos articles.</p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-walmart-darkBlue border-[6px] border-blue-50 shadow-md rounded-3xl flex items-center justify-center text-xl font-bold text-white mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Activez & Vendez</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Activez votre abonnement à 5 000 FCFA/mois et commencez à recevoir des commandes.</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/seller/signup" className="inline-block px-10 py-4 bg-walmart-darkBlue text-white rounded-full font-bold text-lg hover:bg-blue-900 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Ouvrir ma boutique maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
            <div className="text-center md:text-left">
              <div className="text-2xl font-extrabold text-walmart-darkBlue tracking-tight mb-2">EDEN store</div>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">La marketplace communautaire pour soutenir, bâtir et grandir ensemble.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium text-gray-600">
              <Link href="/marketplace" className="hover:text-walmart-blue transition-colors">Catalogue</Link>
              <Link href="/seller/login" className="hover:text-walmart-blue transition-colors">Espace Vendeur</Link>
              <Link href="/login" className="hover:text-walmart-blue transition-colors">Mon Compte</Link>
            </div>
          </div>
          <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} EDEN store. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}