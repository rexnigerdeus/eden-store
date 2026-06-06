import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const resolvedParams = await params
  const productId = resolvedParams.id

  const { data: product, error } = await supabase.from('products').select('*').eq('id', productId).single()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  if (error || !product) {
    redirect('/seller/dashboard/products')
  }

  async function saveChanges(formData: FormData) {
    'use server'
    const db = await createClient()
    const updates = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category_id: formData.get('category_id') as string || null,
    }
    await db.from('products').update(updates).eq('id', productId)
    redirect('/seller/dashboard/products')
  }

  const inputClasses = "w-full p-4 text-sm font-bold text-black border-2 border-gray-300 outline-none focus:border-black bg-white placeholder-gray-400 transition-colors"
  const labelClasses = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="border-b border-gray-200 pb-6 flex items-center gap-4">
        <Link href="/seller/dashboard/products" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline">
          Retour
        </Link>
        <h1 className="text-2xl font-montserrat font-black text-black uppercase tracking-tight ml-auto">
          Éditer l'article
        </h1>
      </div>

      <form action={saveChanges} className="bg-gray-50 border-2 border-black p-6 md:p-10 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="title" className={labelClasses}>Nom de l'article *</label>
            <input id="title" name="title" type="text" required defaultValue={product.title} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="category_id" className={labelClasses}>Catégorie *</label>
            <select id="category_id" name="category_id" required defaultValue={product.category_id || ''} className={`${inputClasses} appearance-none cursor-pointer`}>
              <option value="">Sélectionner...</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="price" className={labelClasses}>Prix de vente (FCFA) *</label>
          <input id="price" name="price" type="number" min="0" step="1" required defaultValue={product.price} className={inputClasses} />
        </div>

        <div>
          <label htmlFor="description" className={labelClasses}>Description détaillée *</label>
          <textarea id="description" name="description" rows={5} required defaultValue={product.description} className={`${inputClasses} resize-none`} />
        </div>

        <div className="border-t border-gray-300 pt-8">
          <button type="submit" className="w-full md:w-auto px-10 py-4 bg-black text-white text-sm font-montserrat font-black uppercase tracking-widest hover:bg-gray-900 transition-colors border-2 border-black">
            Mettre à jour l'article
          </button>
        </div>

      </form>
    </div>
  )
}