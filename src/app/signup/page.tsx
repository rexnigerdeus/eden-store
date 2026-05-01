import Navbar from '@/components/Navbar'
import SignupForm from './SignupForm'

export default function BuyerSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:py-12">
        <SignupForm />
      </main>
    </div>
  )
}