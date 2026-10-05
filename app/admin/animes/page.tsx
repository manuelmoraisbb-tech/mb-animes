import { getAllAnimes } from '@/lib/catalog'
import Link from 'next/link'

export default function AdminAnimesPage() {
  const animes = getAllAnimes()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">Animes</h1>
        <Link href="/admin/animes/novo" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          + Novo anime
        </Link>
      </div>

      <div className="space-y-3">
        {animes.map((anime) => (
          <div key={anime.slug} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-semibold">{anime.title}</p>
              <p className="text-sm text-muted-foreground">{anime.seasons.length} temporadas · {anime.totalEpisodes} episódios</p>
            </div>
            <Link href={`/admin/episodios?anime=${anime.slug}`} className="text-sm text-primary underline-offset-4 hover:underline">
              Gerenciar episódios
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
