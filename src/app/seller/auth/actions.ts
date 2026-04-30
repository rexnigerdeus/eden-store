'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Récupération des données du formulaire
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Tentative de connexion via Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // En situation réelle, on renverrait l'erreur à l'interface, 
    // mais pour simplifier ici, on redirige vers une page d'erreur.
    redirect('/seller/login?message=Identifiants incorrects')
  }

  // Si succès, on met à jour le cache et on redirige vers le tableau de bord
  revalidatePath('/', 'layout')
  redirect('/seller/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Inscription via Supabase
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'seller' // On assigne le rôle vendeur par défaut ici
      }
    }
  })

  if (error) {
    redirect('/seller/signup?message=Erreur lors de la création du compte')
  }

  // Redirection vers le tableau de bord (ou une page demandant de vérifier l'email)
  revalidatePath('/', 'layout')
  redirect('/seller/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  
  // Demande à Supabase de fermer la session (supprime le cookie)
  await supabase.auth.signOut()
  
  // Redirige l'utilisateur vers la page de connexion
  redirect('/seller/login')
}

export async function resetPasswordRequest(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // Demande à Supabase d'envoyer un email de réinitialisation
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Cette URL est celle où l'utilisateur atterrira après avoir cliqué dans son email
    // En production, tu remplaceras localhost par ton vrai nom de domaine
    redirectTo: 'http://localhost:3000/seller/reset-password',
  })

  if (error) {
    console.error("Erreur reset password:", error)
    return { error: "Une erreur est survenue." }
  }

  return { success: "Si cette adresse existe, un email a été envoyé." }
}