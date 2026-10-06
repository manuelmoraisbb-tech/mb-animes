import { getAllAnimes, getAnimeBySlug, type Anime } from '@/lib/catalog'
import Link from 'next/link'

export default function AdminEpisodesPage({ searchParams }: { searchParams?: { anime?: string } }) {
  const animes = getAllAnimes()
  const selectedSlug = searchParams?.anime || animes[0]?.slug
  const selectedAnime = animes.find((anime) => anime.slug === selectedSlug) || animes[0]

  async function handleDelete(animeSlug: string, season: number, episodeNumber: number) {
    if (!confirm(`Deseja excluir o episódio ${episodeNumber}?`)) return

    const response = await fetch('/api/admin/episodios', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animeSlug, season, episodeNumber }),
    })

    if (response.ok) {
      window.location.reload()
      return
    }

    alert('Erro ao excluir episódio')
  }

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
                  <div key={episode.number} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
                    <div>
                      <p className="font-medium">Episódio {episode.number}</p>
                      <p className="text-sm text-muted-foreground">{episode.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedAnime.slug, season.number, episode.number)}
                      className="rounded-md border border-red-600 px-3 py-1.5 text-sm text-red-600 hover:bg-red-600/10"
                    >
                      Excluir
                    </button>
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
