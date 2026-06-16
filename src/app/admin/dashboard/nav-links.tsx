'use client'

import AdminNav from '../AdminNav'

// Wrapper léger : AdminNav est rendu ici aussi pour bénéficier des badges
// temps réel (boutiques en attente, tickets support non lus).
export default function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  return <AdminNav onLinkClick={onLinkClick} />
}
