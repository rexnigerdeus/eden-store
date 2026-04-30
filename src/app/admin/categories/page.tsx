import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

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
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    // On utilise supabaseAdmin pour outrepasser les règles RLS en écriture
    const { error } = await supabaseAdmin.from('categories').insert({
      name,
      slug,
      icon
    })

    if (error) console.error("Erreur création catégorie :", error)
    revalidatePath('/admin/categories')
  }

  // Action Serveur : Supprimer une catégorie
  async function deleteCategory(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await supabaseAdmin.from('categories').delete().eq('id', id)
    revalidatePath('/admin/categories')
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
        <p className="text-gray-500 mt-2">Créez les rubriques dans lesquelles les vendeurs pourront classer leurs articles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Colonne de gauche : Formulaire d'ajout */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle catégorie</h2>
            
            <form action={createCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom (ex: Électronique)</label>
                <input type="text" name="name" required className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icône (Emoji)</label>
                <input type="text" name="icon" placeholder="📱" maxLength={2} className="w-full px-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none text-2xl" />
              </div>
              <button type="submit" className="w-full py-2 bg-walmart-darkBlue text-white font-medium rounded-lg hover:bg-blue-900 transition-colors">
                Ajouter
              </button>
            </form>
          </div>
        </div>

        {/* Colonne de droite : Liste des catégories */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Catégories actives ({categories?.length || 0})</h2>
            </div>
            
            {categories && categories.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl bg-walmart-light p-2 rounded-lg">{cat.icon || '📁'}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400 font-mono">/{cat.slug}</p>
                      </div>
                    </div>
                    
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button type="submit" className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Supprimer">
                        🗑️
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Aucune catégorie n'a encore été créée.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}