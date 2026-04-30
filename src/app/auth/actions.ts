'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signupBuyer(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  // Inscription du client (le rôle 'buyer' sera attribué automatiquement par notre Trigger SQL)
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'buyer',
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  redirect('/') // On le redirige vers l'accueil après inscription
}

export async function loginBuyer(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Email ou mot de passe incorrect." }
  }

  revalidatePath('/')
  redirect('/')
}

export async function logoutBuyer() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
  redirect('/')
}