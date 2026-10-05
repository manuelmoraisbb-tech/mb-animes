import { getAllAnimes } from '@/lib/catalog'
import Link from 'next/link'

export default function AdminEpisodesPage({ searchParams }: { searchParams?: { anime?: string } }) {
  const animes = getAllAnimes()
  const selectedSlug = searchParams?.anime || animes[0]?.slug
  const selectedAnime = animes.find((anime) => anime.slug === selectedSlug) || animes[0]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">Episódios</h1>
        <Link href="/admin/episodios/novo" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          + Novo episódio
        </Link>
      </div>

      {selectedAnime ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {animes.map((anime) => (
              <Link
                key={anime.slug}
                href={`/admin/episodios?anime=${anime.slug}`}
                className={`rounded-full border px-3 py-1.5 text-sm ${selectedAnime.slug === anime.slug ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}
              >
                {anime.title}
              </Link>
            ))}
          </div>

          {selectedAnime.seasons.map((season) => (
            <div key={season.number} className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-lg font-bold">Temporada {season.number}</h2>
              <div className="space-y-2">
                {season.episodes.map((episode) => (
                  <div key={episode.number} className="rounded-lg border border-border bg-background p-3">
                    <p className="font-medium">Episódio {episode.number}</p>
                    <p className="text-sm text-muted-foreground">{episode.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Nenhum anime encontrado.</p>
      )}
    </div>
  )
}
