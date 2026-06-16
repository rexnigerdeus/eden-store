import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import CategoryRowActions from './CategoryRowActions'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  // Récupérer les catégories existantes
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  // Action Serveur : Créer une catégorie
  async function createCategory(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const icon = formData.get('icon') as string

    // Génération automatique d'un slug (ex: "Mode Femme" -> "mode-femme")
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    // Vérifier l'unicité du slug avant insertion pour éviter une erreur de contrainte
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      console.error('[createCategory] slug déjà utilisé :', slug)
      return
    }

    // On utilise supabaseAdmin pour outrepasser les règles RLS en écriture
    const { error } = await supabaseAdmin.from('categories').insert({
      name,
      slug,
      icon,
    })

    if (error) console.error('Erreur création catégorie :', error)

    // Revalider toutes les pages qui dépendent de la liste des catégories
    revalidatePath('/admin/categories')
    revalidatePath('/')
    revalidatePath('/marketplace')
    revalidatePath('/search')
  }

  // Action Serveur : Supprimer une catégorie
  async function deleteCategory(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await supabaseAdmin.from('categories').delete().eq('id', id)
    revalidatePath('/admin/categories')
    revalidatePath('/')
    revalidatePath('/marketplace')
    revalidatePath('/search')
  }

  // --- CLASSES CSS RÉUTILISABLES ---
  const inputClasses =
    'w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors rounded-none uppercase tracking-widest'
  const labelClasses = 'block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2'

  const safeCategories = categories || []

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      {/* EN-TÊTE */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">
          Catégories
        </h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">
          Créez et modifiez les rubriques de classification du catalogue.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE DE GAUCHE : FORMULAIRE D'AJOUT */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border-2 border-black p-6 md:p-8">
            <h2 className="text-sm font-montserrat font-black text-black uppercase tracking-widest mb-6">
              Nouvelle catégorie
            </h2>

            <form action={createCategory} className="space-y-6">
              <div>
                <label className={labelClasses}>Nom de la rubrique *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="EX: VÊTEMENTS"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Icône (Emoji) *</label>
                <input
                  type="text"
                  name="icon"
                  required
                  placeholder="👕"
                  maxLength={2}
                  className={`${inputClasses} text-2xl text-center`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-black text-white font-montserrat font-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors border-2 border-black mt-4"
              >
                Ajouter au registre
              </button>
            </form>
          </div>
        </div>

        {/* COLONNE DE DROITE : LISTE DES CATÉGORIES */}
        <div className="lg:col-span-2">
          <div className="bg-white border-2 border-black flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b-2 border-black bg-black text-white">
              <h2 className="text-sm font-montserrat font-black uppercase tracking-widest">
                Catégories actives ({safeCategories.length})
              </h2>
            </div>

            {safeCategories.length > 0 ? (
              <ul className="divide-y-2 divide-gray-100 flex-1 bg-white">
                {safeCategories.map((cat) => (
                  <li
                    key={cat.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-6 min-w-0 flex-1">
                      <div className="w-14 h-14 bg-gray-100 border-2 border-black flex items-center justify-center text-3xl shrink-0">
                        {cat.icon || '📁'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-montserrat font-black text-black text-lg uppercase tracking-wider truncate">
                          {cat.name}
                        </p>
                        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">
                          /{cat.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <CategoryRowActions category={cat} />
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={cat.id} />
                        <button
                          type="submit"
                          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 border-2 border-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors"
                          title="Supprimer la catégorie"
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest flex-1 flex items-center justify-center bg-gray-50">
                Le registre des catégories est actuellement vide.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
