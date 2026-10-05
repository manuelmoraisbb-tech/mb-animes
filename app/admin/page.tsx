import { getCatalogStats } from '@/lib/catalog'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const stats = getCatalogStats()

  return (
    <div>
      <h1 className="mb-8 text-3xl font-black">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total de animes</p>
          <p className="mt-2 text-4xl font-black">{stats.animes}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total de episódios</p>
          <p className="mt-2 text-4xl font-black">{stats.episodes}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/animes/novo" className="rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primary-foreground">
          + Novo anime
        </Link>
        <Link href="/admin/episodios/novo" className="rounded-xl bg-secondary px-4 py-3 text-center font-semibold text-secondary-foreground">
          + Novo episódio
        </Link>
      </div>
    </div>
  )
}
