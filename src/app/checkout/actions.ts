'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js' // <-- NOUVEL IMPORT
import { CartItem } from '@/context/CartContext'

// Création d'un client "Admin" qui bypass le RLS (à utiliser UNIQUEMENT côté serveur)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function placeOrder(cart: CartItem[], shippingData: {
  full_name: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  password?: string
}) {
  const supabase = await createClient() // Client normal pour récupérer la session
  let { data: { user } } = await supabase.auth.getUser()

  if (cart.length === 0) return { error: "Votre panier est vide." }

  try {
    // 1. CRÉATION DE COMPTE (On utilise le client normal ici pour que la session s'établisse si besoin)
    if (!user && shippingData.email && shippingData.password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: shippingData.email,
        password: shippingData.password,
        options: { data: { full_name: shippingData.full_name } }
      })
      if (authError) throw new Error("Erreur lors de la création du compte : " + authError.message)
      user = authData.user
    }

    const groupedByShop = cart.reduce((acc: any, item) => {
      if (!acc[item.shop_id]) acc[item.shop_id] = []
      acc[item.shop_id].push(item)
      return acc
    }, {})

    const createdOrders: { id: string, shop_name: string }[] = []

    // 2. CRÉATION DES COMMANDES (On utilise le client ADMIN pour bypasser le RLS)
    for (const shopId in groupedByShop) {
      const items = groupedByShop[shopId]
      const totalAmount = items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0)
      const shopName = items[0].shop_name

      const { data: order, error: orderError } = await supabaseAdmin // <-- SUPABASE ADMIN ICI
        .from('orders')
        .insert({
          customer_id: user?.id || null, 
          shop_id: shopId,
          total_amount: totalAmount,
          status: 'pending',
          shipping_address: `${shippingData.full_name}, ${shippingData.address}, ${shippingData.city}`,
          customer_address: `${shippingData.address}, ${shippingData.city}`,
          customer_city: shippingData.city,
          customer_phone: shippingData.phone,
          customer_name: shippingData.full_name
        })
        .select()
        .single()

      if (orderError) throw orderError
      
      createdOrders.push({ id: order.id, shop_name: shopName })

      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.price
      }))

      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems) // <-- SUPABASE ADMIN ICI
      if (itemsError) throw itemsError
    }

    return { success: true, createdOrders }
  } catch (error: any) {
    console.error("Erreur commande :", error)
    return { error: error.message || "Une erreur est survenue lors de la validation." }
  }
}