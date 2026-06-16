import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'
import SellerReminderControls from './SellerReminderControls'
import { getSellerReminderState } from '@/app/actions/adminSupportActions'

// Page dynamique : on lit toujours la liste fraîche des utilisateurs.
export const dynamic = 'force-dynamic'

type Profile = {
  id: string
  full_name: string | null
  role: string | null
  created_at: string
}

type Shop = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  subscription_status: string | null
  seller_id: string
}

type UserRow = {
  id: string
  full_name: string
  email: string
  role: 'seller' | 'buyer' | string
  created_at: string
  shop: Pick<Shop, 'id' | 'name' | 'slug' | 'subscription_status' | 'logo_url'> | null
}

const ROLE_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  seller: {
    label: 'Vendeur',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-600',
  },
  buyer: {
    label: 'Acheteur',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-black',
  },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function AdminUsersPage() {
  // 1) Récupérer TOUS les profils (rôle inclus)
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })

  if (profilesError) {
    console.error('[admin/users] profiles error:', profilesError)
  }

  // 2) Récupérer TOUTES les boutiques pour faire la jointure
  const { data: shops, error: shopsError } = await supabaseAdmin
    .from('shops')
    .select('id, name, slug, logo_url, subscription_status, seller_id')

  if (shopsError) {
    console.error('[admin/users] shops error:', shopsError)
  }

  // 3) Récupérer les emails depuis auth.users (admin only)
  // On pagine par sécurité (max 1000 par page Next.js par défaut)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) {
    console.error('[admin/users] auth error:', authError)
  }

  // Indexer les emails par user id pour la jointure
  const emailById = new Map<string, string>()
  for (const u of authData?.users || []) {
    emailById.set(u.id, u.email || '')
  }

  // 4) Construire la liste finale : on EXCLUT les admins
  const allRows: UserRow[] = (profiles || [])
    .filter((p: Profile) => p.role !== 'admin')
    .map((p: Profile) => {
      const shop = (shops || []).find((s: Shop) => s.seller_id === p.id) || null
      return {
        id: p.id,
        full_name: p.full_name || '—',
        email: emailById.get(p.id) || '—',
        role: p.role || 'buyer',
        created_at: p.created_at,
        shop: shop
          ? {
              id: shop.id,
              name: shop.name,
              slug: shop.slug,
              subscription_status: shop.subscription_status,
              logo_url: shop.logo_url,
            }
          : null,
      }
    })

  // Stats rapides
  const totalUsers = allRows.length
  const totalSellers = allRows.filter((u) => u.role === 'seller').length
  const totalBuyers = allRows.filter((u) => u.role === 'buyer').length
  const sellersWithoutShopRows = allRows.filter(
    (u) => u.role === 'seller' && !u.shop
  )
  const sellersWithoutShop = sellersWithoutShopRows.length

  // État du toggle rappel vendeur
  const { enabled: reminderEnabled } = await getSellerReminderState()

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      {/* EN-TÊTE */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-montserrat font-black text-black uppercase tracking-tight">
          Comptes utilisateurs
        </h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">
          Liste des acheteurs et vendeurs inscrits sur la plateforme. Les comptes
          administrateurs ne sont pas affichés ici.
        </p>
      </div>

      {/* CONTRÔLE RAPPEL VENDEUR */}
      <SellerReminderControls
        initialEnabled={reminderEnabled}
        sellersWithoutShop={sellersWithoutShopRows.map((u) => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          created_at: u.created_at,
        }))}
      />

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black p-4 md:p-6">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Comptes affichés
          </p>
          <p className="font-montserrat font-black text-2xl md:text-4xl">{totalUsers}</p>
        </div>
        <div className="bg-red-50 border-2 border-red-600 p-4 md:p-6">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2">
            Vendeurs
          </p>
          <p className="font-montserrat font-black text-2xl md:text-4xl text-red-700">
            {totalSellers}
          </p>
        </div>
        <div className="bg-white border-2 border-black p-4 md:p-6">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Acheteurs
          </p>
          <p className="font-montserrat font-black text-2xl md:text-4xl">{totalBuyers}</p>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-600 p-4 md:p-6">
          <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-2">
            Vendeurs sans boutique
          </p>
          <p className="font-montserrat font-black text-2xl md:text-4xl text-yellow-700">
            {sellersWithoutShop}
          </p>
        </div>
      </div>

      {/* ALERTE — Vendeurs sans boutique */}
      {sellersWithoutShop > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-600 p-5 flex items-start gap-3">
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <p className="font-montserrat font-black text-sm uppercase tracking-tight text-yellow-800">
              {sellersWithoutShop} compte(s) vendeur(s) sans boutique
            </p>
            <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
              Ces utilisateurs ont souscrit au rôle vendeur (charte acceptée) mais
              n'ont pas encore créé leur boutique. Vous pouvez les relancer.
            </p>
          </div>
        </div>
      )}

      {/* TABLEAU */}
      <div className="bg-white border-2 border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-[10px] uppercase tracking-widest font-bold">
                <th className="p-4 sm:p-6 border-b-2 border-black">Utilisateur</th>
                <th className="p-4 sm:p-6 border-b-2 border-black">Rôle</th>
                <th className="p-4 sm:p-6 border-b-2 border-black">Boutique</th>
                <th className="p-4 sm:p-6 border-b-2 border-black">Inscription</th>
              </tr>
            </thead>

            <tbody className="divide-y-2 divide-black">
              {allRows.length > 0 ? (
                allRows.map((u) => {
                  const style = ROLE_STYLES[u.role] || ROLE_STYLES.buyer
                  const initial = (u.full_name || u.email || '?').charAt(0).toUpperCase()

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      {/* Utilisateur */}
                      <td className="p-4 sm:p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-11 h-11 bg-gray-100 border-2 border-black flex items-center justify-center font-montserrat font-black uppercase text-lg shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-montserrat font-black text-sm text-black uppercase tracking-wider truncate">
                              {u.full_name}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="p-4 sm:p-6">
                        <span
                          className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${style.bg} ${style.text} ${style.border}`}
                        >
                          {style.label}
                        </span>
                      </td>

                      {/* Boutique */}
                      <td className="p-4 sm:p-6">
                        {u.role === 'seller' ? (
                          u.shop ? (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gray-100 border-2 border-black flex items-center justify-center font-montserrat font-black uppercase text-sm shrink-0">
                                {u.shop.logo_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={u.shop.logo_url}
                                    alt={u.shop.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  u.shop.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/shop/${u.shop.slug}`}
                                  target="_blank"
                                  className="font-montserrat font-black text-sm text-black uppercase tracking-wider hover:text-red-600 truncate inline-block max-w-[180px]"
                                >
                                  {u.shop.name}
                                </Link>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-1">
                                  <span
                                    className={
                                      u.shop.subscription_status === 'active'
                                        ? 'text-green-600'
                                        : u.shop.subscription_status === 'pending_verification'
                                          ? 'text-yellow-700'
                                          : 'text-gray-500'
                                    }
                                  >
                                    {u.shop.subscription_status === 'active'
                                      ? '● Active'
                                      : u.shop.subscription_status === 'pending_verification'
                                        ? '● En attente'
                                        : u.shop.subscription_status || '—'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-yellow-600 bg-yellow-50 text-yellow-700">
                              ⚠ Pas de boutique
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            —
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 sm:p-6">
                        <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                          {formatDate(u.created_at)}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-50"
                  >
                    Aucun utilisateur enregistré pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center">
        Les comptes administrateurs ne sont pas listés ici par sécurité.
      </p>
    </div>
  )
}
