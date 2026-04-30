import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function EditProductPage({
  params
}: {
  // 1. On précise à TypeScript que params est une Promesse
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()

  // 2. On attend (await) de résoudre les paramètres pour obtenir l'ID
  const resolvedParams = await params
  const productId = resolvedParams.id

  // 3. On utilise productId (qui est maintenant bien un texte)
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error || !product) {
    redirect('/seller/dashboard/products')
  }

  // Action Serveur pour la mise à jour
  async function saveChanges(formData: FormData) {
    'use server'
    const db = await createClient()
    
    const updates = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category_id: formData.get('category_id') as string || null,
    }

    // On utilise productId ici aussi
    await db.from('products').update(updates).eq('id', productId)
    redirect('/seller/dashboard/products')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/seller/dashboard/products" className="text-gray-500 hover:text-walmart-blue font-medium">
          &larr; Retour
        </Link>
        <h1 className="text-2xl font-semibold text-walmart-darkBlue">Modifier le produit</h1>
      </div>

      <form action={saveChanges} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
          <input
            id="title" name="title" type="text" required defaultValue={product.title}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none"
          />
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select 
            id="category_id" name="category_id" required defaultValue={product.category_id || ''}
            className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none cursor-pointer"
          >
            <option value="">Sélectionnez une catégorie...</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description" name="description" rows={4} required defaultValue={product.description}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none resize-none"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
          <input
            id="price" name="price" type="number" min="0" step="1" required defaultValue={product.price}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="px-6 py-3 bg-walmart-yellow text-walmart-darkBlue font-semibold rounded-lg hover:bg-yellow-400 transition-colors shadow-sm">
            Enregistrer les modifications
          </button>
        </div>

      </form>
    </div>
  )
}