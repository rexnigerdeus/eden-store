/**
 * Calcul du nombre d'abonnés "fantômes" à ajouter enjoliveur.
 * Règle : pour chaque palier de 5 VRAIS abonnés, on ajoute 5 abonnés fantômes.
 * Donc : floor(realCount / 5) * 5 fantômes, en plus des vrais.
 *
 * NOTE : Ce calcul est volontairement isolé dans un fichier utilitaire
 * (et non dans un `actions.ts`) pour deux raisons :
 *  1. Éviter l'erreur Next.js "Server Actions must be async functions"
 *     (Next considère toutes les exports d'un fichier `actions.ts` comme
 *     des Server Actions, qui doivent être async).
 *  2. Permettre l'usage côté serveur ET côté client si besoin (cohérence).
 */
export function computeGhostSubscribers(realCount: number): number {
  return Math.floor(realCount / 5) * 5
}
