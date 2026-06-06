import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { createProduct } from '../actions'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  
  const { data: categories } = await supabase.from('categories').select('*').order('name', { ascending: true })

  const inputClasses = "w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors"
  const labelClasses = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="border-b border-gray-200 pb-6 flex items-center gap-4">
        <Link href="/seller/dashboard/products" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline">
          Retour
        </Link>
        <h1 className="text-2xl font-montserrat font-black text-black uppercase tracking-tight ml-auto">
          Nouvel Article
        </h1>
      </div>

      {resolvedParams.message && (
        <div className="p-4 border-2 border-red-600 bg-red-50 text-xs font-bold uppercase tracking-widest text-red-600">
          ⚠️ {resolvedParams.message}
        </div>
      )}

      <form action={createProduct} className="bg-gray-50 border-2 border-black p-6 md:p-10 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="title" className={labelClasses}>Nom de l'article *</label>
            <input id="title" name="title" type="text" required placeholder="T-shirt Noir Oversize" className={inputClasses} />
          </div>

          <div>
            <label htmlFor="category_id" className={labelClasses}>Catégorie *</label>
            <select id="category_id" name="category_id" required className={`${inputClasses} appearance-none cursor-pointer`}>
              <option value="">Sélectionner...</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="price" className={labelClasses}>Prix de vente (FCFA) *</label>
            <input id="price" name="price" type="number" min="0" step="1" required placeholder="15000" className={inputClasses} />
          </div>

          <div>
            <label htmlFor="image" className={labelClasses}>Photographie officielle *</label>
            <input id="image" name="image" type="file" accept="image/*" required className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:text-xs file:font-bold file:uppercase file:tracking-widest cursor-pointer hover:file:bg-gray-900 p-2`} />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClasses}>Description détaillée *</label>
          <textarea id="description" name="description" rows={5} required placeholder="Coupe, matière, détails..." className={`${inputClasses} resize-none`} />
        </div>

        <div className="border-t border-gray-300 pt-8">
          <button type="submit" className="w-full md:w-auto px-10 py-4 bg-black text-white text-sm font-montserrat font-black uppercase tracking-widest hover:bg-gray-900 transition-colors border-2 border-black">
            Enregistrer dans l'inventaire
          </button>
        </div>

      </form>
    </div>
  )
}