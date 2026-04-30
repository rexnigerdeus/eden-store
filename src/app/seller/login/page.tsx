import Link from 'next/link'
import { login } from '../auth/actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        
        <div className="text-center">
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Espace Vendeur</h1>
          <p className="mt-2 text-sm text-gray-500">
            Connectez-vous pour gérer votre boutique Asim.
          </p>
        </div>

        {searchParams.message && (
          <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md text-center">
            {searchParams.message}
          </div>
        )}

        <form className="mt-8 space-y-6" action={login}>
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                {/* NOUVEAU LIEN ICI */}
                <Link href="/seller/forgot-password" className="text-sm font-medium text-walmart-blue hover:underline">
                  Oublié ?
                </Link>
              </div>
              <input
                id="password" name="password" type="password" required placeholder="••••••••"
                className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-lg focus:ring-1 focus:ring-walmart-blue outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-walmart-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link href="/seller/signup" className="font-medium text-black hover:underline">
            Créer une boutique
          </Link>
        </p>
      </div>
    </div>
  )
}