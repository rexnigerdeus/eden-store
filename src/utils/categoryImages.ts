// Cartographie centralisée des images thématiques par catégorie.
// Toutes les URLs ont été vérifiées et retournent du contenu (HTTP 200).
// L'ordre des `if` est important : on commence par les checks les plus spécifiques.

export function getCategoryImageUrl(categoryName: string): string {
  const name = (categoryName || '').toLowerCase()

  // 🎨 ART & ARTISANAT (en premier pour ne pas être confondu avec "art" dans "artisan")
  if (name.includes('artisanat') || name.includes('art & artisan') || (name.includes('art') && !name.includes('article'))) {
    return "https://images.unsplash.com/photo-1721508490084-1b1de5b230d4?q=80&w=2071&auto=format&fit=crop"
  }
  // 💄 BEAUTÉ / COSMÉTIQUE / BIEN-ÊTRE / PARFUM / SOINS / MAQUILLAGE
  if (
    name.includes('beauté') || name.includes('beaute') ||
    name.includes('cosmet') || name.includes('cosmétique') ||
    name.includes('bien-être') || name.includes('bien-etre') ||
    name.includes('parfum') || name.includes('soin') ||
    name.includes('maquillage') || name.includes('hygiène') || name.includes('hygiene')
  ) {
    return "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?q=80&w=1035&auto=format&fit=crop"
  }
  // 👕 MODE / VÊTEMENTS / ACCESSOIRES (Mode & Accessoires)
  if (
    name.includes('mode') || name.includes('habillement') || name.includes('vêtement') || name.includes('vetement') ||
    name.includes('t-shirt') || name.includes('tshirt') || name.includes('shirt') ||
    name.includes('hoodie') || name.includes('pull') || name.includes('robe') || name.includes('jupe') ||
    name.includes('accessoire') || name.includes('casquette') || name.includes('sac') ||
    name.includes('bijoux') || name.includes('ceinture') || name.includes('montre') || name.includes('lunette')
  ) {
    return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
  }
  // 🏠 MAISON / DÉCO / CUISINE / LINGE
  if (
    name.includes('maison') || name.includes('déco') || name.includes('deco') ||
    name.includes('cuisine') || name.includes('intérieur') || name.includes('interieur') ||
    name.includes('linge') || name.includes('linge de maison')
  ) {
    return "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=2532&auto=format&fit=crop"
  }
  // 📱 HIGH-TECH / ÉLECTRONIQUE / GADGETS
  if (
    name.includes('high-tech') || name.includes('high tech') || name.includes('hightech') ||
    name.includes('électro') || name.includes('electro') || name.includes('électronique') || name.includes('electronique') ||
    name.includes('téléph') || name.includes('teleph') || name.includes('phone') ||
    name.includes('gadget') || name.includes('informatique')
  ) {
    return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop"
  }
  // 🌶️ ÉPICERIE FINE / PRODUITS LOCAUX / ALIMENTATION / BIO
  if (
    name.includes('épicerie') || name.includes('epicerie') ||
    name.includes('local') || name.includes('aliment') || name.includes('bio')
  ) {
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop"
  }
  // 🍔 REPAS / PÂTISSERIE / ALIMENTATION / NOURRITURE
  if (
    name.includes('repas') || name.includes('meal') ||
    name.includes('Pâtisserie') || name.includes('sweets') ||
    name.includes('alimentation') || name.includes('dessert')
  ) {
    return "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1022&auto=format&fit=crop"
  }
  // 🧸 ENFANTS / BÉBÉS / JOUETS
  if (
    name.includes('enfant') || name.includes('enfants') ||
    name.includes('bébé') || name.includes('bebe') ||
    name.includes('kid') || name.includes('baby') || name.includes('jouet')
  ) {
    return "https://images.unsplash.com/photo-1534806391029-791d2695c38b?q=80&w=2070&auto=format&fit=crop"
  }
  // 👟 CHAUSSURES / SNEAKERS
  if (
    name.includes('chaussure') || name.includes('sneaker') ||
    name.includes('basket') || name.includes('boot') || name.includes('soulier')
  ) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"
  }
  // 📚 LIVRES / CULTURE
  if (name.includes('livre') || name.includes('book') || name.includes('culture')) {
    return "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop"
  }
  // ⚽ SPORT / FITNESS
  if (name.includes('sport') || name.includes('fitness') || name.includes('gym') || name.includes('athlet')) {
    return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop"
  }
  // 🛍️ Image par défaut (Look urbain / Streetwear)
  return "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop"
}
