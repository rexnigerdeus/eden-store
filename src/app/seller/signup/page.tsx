import Link from 'next/link'
import { signup } from '../auth/actions'

export default function SignupPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* En-tête aéré et élégant */}
        <div className="text-center">
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Devenir vendeur sur Asim</h1>
          <p className="mt-2 text-sm text-gray-500">
            Créez votre boutique et rejoignez la communauté.
          </p>
        </div>

        {/* Affichage des messages d'erreur éventuels */}
        {searchParams.message && (
          <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md text-center">
            {searchParams.message}
          </div>
        )}

        {/* Formulaire lié à l'Action Serveur */}
        <form className="mt-8 space-y-6" action={signup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors outline-none text-gray-900"
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors outline-none text-gray-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-walmart-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Créer mon compte vendeur
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link href="/seller/login" className="font-medium text-black hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}