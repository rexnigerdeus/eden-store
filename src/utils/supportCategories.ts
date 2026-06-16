// ============================================================================
// Catalogue des motifs disponibles pour les tickets de support.
// Source unique utilisée côté client (bulle flottante) et côté admin (lecture).
// ============================================================================

export type SupportCategoryKey =
  | 'question'
  | 'bug'
  | 'paiement'
  | 'livraison'
  | 'retour'
  | 'abonnement'
  | 'suggestion'
  | 'signalement'
  | 'vendeur'
  | 'autre'

export type SupportCategory = {
  key: SupportCategoryKey
  label: string
  icon: string
  description: string
  // Catégories réservées à certains rôles (vide = tous)
  rolesOnly?: ('buyer' | 'seller')[]
}

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    key: 'question',
    label: 'Question générale',
    icon: '❓',
    description: 'Comment ça marche, où trouver une information, etc.',
  },
  {
    key: 'bug',
    label: 'Bug technique',
    icon: '🐞',
    description: 'Le site ne fonctionne pas comme prévu.',
  },
  {
    key: 'paiement',
    label: 'Paiement',
    icon: '💳',
    description: 'Validation, remboursement, mode de paiement.',
  },
  {
    key: 'livraison',
    label: 'Livraison',
    icon: '🚚',
    description: 'Suivi de colis, délais, transporteur.',
  },
  {
    key: 'retour',
    label: 'Retour / SAV',
    icon: '↩️',
    description: 'Retourner un article, SAV, produit reçu cassé.',
  },
  {
    key: 'abonnement',
    label: 'Abonnement',
    icon: '📦',
    description: 'Modifier, suspendre ou résilier mon abonnement.',
  },
  {
    key: 'suggestion',
    label: 'Suggestion',
    icon: '💡',
    description: 'Idée d’amélioration ou nouvelle fonctionnalité.',
  },
  {
    key: 'signalement',
    label: 'Signalement',
    icon: '⚠️',
    description: 'Boutique frauduleuse, avis inapproprié, comportement abusif.',
  },
  {
    key: 'vendeur',
    label: 'Aide vendeur',
    icon: '🏪',
    description: 'Configuration de ma boutique, gestion des commandes.',
    rolesOnly: ['seller'],
  },
  {
    key: 'autre',
    label: 'Autre',
    icon: '🔖',
    description: 'Tout autre sujet qui ne rentre pas dans les catégories ci-dessus.',
  },
]

export function getCategoryMeta(key: string): SupportCategory {
  return (
    SUPPORT_CATEGORIES.find((c) => c.key === key) ??
    SUPPORT_CATEGORIES[SUPPORT_CATEGORIES.length - 1]
  )
}

export function categoriesForRole(role: 'buyer' | 'seller' | 'admin'): SupportCategory[] {
  return SUPPORT_CATEGORIES.filter((c) => !c.rolesOnly || c.rolesOnly.includes(role as any))
}
