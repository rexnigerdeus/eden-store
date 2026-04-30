import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { createProduct } from '../actions'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {

  const supabase = await createClient()
  
  // 1. Récupérer les catégories actives
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* En-tête avec bouton retour */}
      <div className="flex items-center space-x-4 mb-8">
        <Link 
          href="/seller/dashboard/products"
          className="text-gray-500 hover:text-walmart-blue transition-colors font-medium"
        >
          &larr; Retour
        </Link>
        <h1 className="text-2xl font-semibold text-walmart-darkBlue">Ajouter un produit</h1>
      </div>

      {searchParams.message && (
        <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md">
          {searchParams.message}
        </div>
      )}

      {/* Formulaire stylisé Walmart */}
      <form action={createProduct} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Nom du produit
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Ex: T-shirt en coton bio"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue transition-colors outline-none text-gray-900"
          />
        </div>

        {/* --- NOUVEAU BLOC CATÉGORIE --- */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select 
            id="category_id" 
            name="category_id" 
            required 
            className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue outline-none cursor-pointer appearance-none"
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            placeholder="Décrivez votre produit en détail..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue transition-colors outline-none resize-none text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Image principale du produit
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue transition-colors outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-walmart-light file:text-walmart-blue hover:file:bg-blue-100 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Prix (FCFA)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            required
            placeholder="Ex: 5000"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue transition-colors outline-none text-gray-900"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-walmart-yellow text-walmart-darkBlue font-semibold rounded-lg hover:bg-yellow-400 transition-colors shadow-sm"
          >
            Sauvegarder le produit
          </button>
        </div>

      </form>
    </div>
  )
}