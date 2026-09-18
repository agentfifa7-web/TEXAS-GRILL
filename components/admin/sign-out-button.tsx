'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="btn btn-outline btn-sm w-full">
      <LogOut size={14} /> Se déconnecter
    </button>
  )
}
