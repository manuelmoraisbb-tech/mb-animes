'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, LogOut, User } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'

export function UserMenu() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  if (isLoading) return <span className="size-11" aria-hidden="true" />

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="flex h-11 items-center gap-2 px-3 text-sm font-bold text-muted-foreground transition hover:bg-background hover:text-foreground"
      >
        <User className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">Entrar</span>
      </Link>
    )
  }

  async function signOut() {
    await createClient().auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      {user.isAdmin && (
        <Link href="/admin" aria-label="Painel de administração" className="flex size-11 items-center justify-center text-muted-foreground transition hover:bg-background hover:text-foreground">
          <LayoutDashboard className="size-5" aria-hidden="true" />
        </Link>
      )}
      <span className="flex items-center gap-2 px-2 text-sm font-bold">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-black uppercase text-primary-foreground">
          {user.username.charAt(0)}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{user.username}</span>
      </span>
      <button
        type="button"
        onClick={signOut}
        aria-label="Sair"
        className="flex size-11 items-center justify-center text-muted-foreground transition hover:bg-background hover:text-foreground"
      >
        <LogOut className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
