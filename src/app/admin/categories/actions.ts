'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Met à jour une catégorie (nom + slug + icône).
 * Le slug n'étant PAS stocké en dur ailleurs dans la base (les produits
 * sont liés via `category_id`), la mise à jour se propage automatiquement
 * à toutes les pages qui lisent le slug dynamiquement (ex: /search?category=…).
 *
 * Retourne `{ error: string }` en cas d'échec, `null` en cas de succès.
 */
export async function updateCategory(formData: FormData) {
  const id = formData.get('id') as string | null
  const name = (formData.get('name') as string | null)?.trim()
  const slug = (formData.get('slug') as string | null)?.trim()
  const icon = (formData.get('icon') as string | null)?.trim() || null

  if (!id) return { error: 'Identifiant de catégorie manquant.' }
  if (!name) return { error: 'Le nom est obligatoire.' }
  if (!slug) return { error: 'Le slug est obligatoire.' }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets.' }
  }

  // Vérifier l'unicité du slug (un autre enregistrement ne doit pas l'utiliser)
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .neq('id', id)
    .maybeSingle()

  if (lookupError) {
    console.error('[updateCategory] lookup error:', lookupError)
    return { error: 'Erreur lors de la vérification du slug.' }
  }
  if (existing) {
    return { error: 'Ce slug est déjà utilisé par une autre catégorie.' }
  }

  const { error } = await supabaseAdmin
    .from('categories')
    .update({ name, slug, icon })
    .eq('id', id)

  if (error) {
    console.error('[updateCategory] update error:', error)
    return { error: 'Impossible de mettre à jour la catégorie.' }
  }

  // Revalider toutes les pages susceptibles d'afficher la liste des catégories
  // ou de filtrer par slug de catégorie. Cela force Next.js à refetcher les
  // données depuis Supabase au prochain accès.
  revalidatePath('/admin/categories')
  revalidatePath('/')              // page d'accueil (Hero slider + grille catégories)
  revalidatePath('/marketplace')    // marketplace publique
  revalidatePath('/search')         // page de recherche/filtrage par slug
  revalidatePath('/admin/dashboard')

  return null
}
