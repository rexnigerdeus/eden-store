import Navbar from '@/components/Navbar'
import LoginForm from './LoginForm'

export default function BuyerLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:py-12">
        {/* On appelle le composant client ici */}
        <LoginForm />
      </main>
    </div>
  )
}