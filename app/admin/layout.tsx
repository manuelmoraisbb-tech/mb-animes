import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const ADMIN_TOKEN = process.env.ADMIN_PASSWORD || 'admin123'

async function logoutAction() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.set('mb_admin_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  redirect('/admin/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('mb_admin_token')?.value

  if (token !== ADMIN_TOKEN) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-muted/30 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-black">MB Admin</h1>
        </div>

        <nav className="space-y-2">
          <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-background">Dashboard</Link>
          <Link href="/admin/animes" className="block rounded-lg px-3 py-2 hover:bg-background">Animes</Link>
          <Link href="/admin/episodios" className="block rounded-lg px-3 py-2 hover:bg-background">Episódios</Link>
        </nav>

        <form action={logoutAction} className="mt-8">
          <button type="submit" className="w-full rounded-lg border border-border px-3 py-2 text-left hover:bg-background">
            Sair
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  )
}
