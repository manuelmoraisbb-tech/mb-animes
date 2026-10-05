import { getAllAnimes, getAnimeBySlug, slugify } from '@/lib/catalog'
import Link from 'next/link'

export default function AdminAnimesPage() {
  const animes = getAllAnimes()

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Deseja excluir "${title}"?`)) return

    const response = await fetch(`/api/admin/animes/${slug}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      window.location.reload()
      return
    }

    alert('Erro ao excluir anime')
  }

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
          <div key={anime.slug} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-semibold">{anime.title}</p>
              <p className="text-sm text-muted-foreground">{anime.seasons.length} temporadas · {anime.totalEpisodes} episódios</p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/animes/${anime.slug}`} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-background">
                Editar
              </Link>
              <Link href={`/admin/episodios?anime=${anime.slug}`} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
                Episódios
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(anime.slug, anime.title)}
                className="rounded-md border border-red-600 px-3 py-1.5 text-sm text-red-600 hover:bg-red-600/10"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
