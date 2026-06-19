import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import ProductForm from './ProductForm'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await searchParams

  const { data: categories } = await supabase.from('categories').select('*').order('name', { ascending: true })

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

      <ProductForm categories={categories || []} />
    </div>
  )
}