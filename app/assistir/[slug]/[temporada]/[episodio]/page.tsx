import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VideoPlayer } from '@/components/video-player'
import { EpisodeList } from '@/components/episode-list'
import { getAnimeBySlug, getPlayableUrl, type Anime } from '@/lib/catalog'

type Params = Promise<{ slug: string; temporada: string; episodio: string }>

function resolve(anime: Anime, temporada: string, episodio: string) {
  const seasonIndex = anime.seasons.findIndex((s) => String(s.number) === temporada)
  if (seasonIndex < 0) return null
  const season = anime.seasons[seasonIndex]
  const episodeIndex = season.episodes.findIndex((e) => String(e.number) === episodio)
  if (episodeIndex < 0) return null

  const prev =
    episodeIndex > 0
      ? { season: season.number, episode: season.episodes[episodeIndex - 1].number }
      : seasonIndex > 0
        ? {
            season: anime.seasons[seasonIndex - 1].number,
            episode: anime.seasons[seasonIndex - 1].episodes.at(-1)!.number,
          }
        : null
  const next =
    episodeIndex < season.episodes.length - 1
      ? { season: season.number, episode: season.episodes[episodeIndex + 1].number }
      : seasonIndex < anime.seasons.length - 1
        ? {
            season: anime.seasons[seasonIndex + 1].number,
            episode: anime.seasons[seasonIndex + 1].episodes[0].number,
          }
        : null

  return { season, episode: season.episodes[episodeIndex], prev, next }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, temporada, episodio } = await params
  const anime = getAnimeBySlug(slug)
  if (!anime) return { title: 'Episódio não encontrado' }
  return { title: `${anime.title} — T${temporada} E${episodio}` }
}

export default async function WatchPage({ params }: { params: Params }) {
  const { slug, temporada, episodio } = await params
  const anime = getAnimeBySlug(slug)
  if (!anime) notFound()
  const current = resolve(anime, temporada, episodio)
  if (!current) notFound()

  const { season, episode, prev, next } = current
  const nextHref = next ? `/assistir/${slug}/${next.season}/${next.episode}` : null
  const prevHref = prev ? `/assistir/${slug}/${prev.season}/${prev.episode}` : null

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 md:px-6 lg:grid-cols-[1fr_22rem]">
      <div className="flex min-w-0 flex-col gap-5">
        <VideoPlayer
          key={episode.url}
          src={getPlayableUrl(episode.url)}
          directUrl={episode.url}
          poster={anime.poster}
          title={episode.name}
          nextHref={nextHref}
        />

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <Link href={`/anime/${slug}`} className="text-sm text-primary hover:underline">
              {anime.title}
            </Link>
            <h1 className="font-heading text-2xl font-bold text-balance">
              {`Temporada ${season.number} · Episódio ${episode.number}`}
            </h1>
          </div>
          <div className="flex gap-2">
            <NavButton href={prevHref} direction="prev" />
            <NavButton href={nextHref} direction="next" />
          </div>
        </div>
      </div>

      <aside aria-label={`Episódios da temporada ${season.number}`} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">{`Temporada ${season.number}`}</h2>
          {anime.seasons.length > 1 && (
            <Link href={`/anime/${slug}?t=${season.number}`} className="text-sm text-muted-foreground hover:text-foreground">
              Outras temporadas
            </Link>
          )}
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <EpisodeList slug={slug} season={season} currentEpisode={episode.number} compact />
        </div>
      </aside>
    </div>
  )
}

function NavButton({ href, direction }: { href: string | null; direction: 'prev' | 'next' }) {
  const label = direction === 'prev' ? 'Anterior' : 'Próximo'
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  const className =
    'flex h-10 items-center gap-1 rounded-full border bg-card px-4 text-sm font-medium transition'
  if (!href) {
    return (
      <span aria-disabled="true" className={`${className} cursor-not-allowed opacity-40`}>
        {direction === 'prev' && <Icon className="size-4" aria-hidden="true" />}
        {label}
        {direction === 'next' && <Icon className="size-4" aria-hidden="true" />}
      </span>
    )
  }
  return (
    <Link href={href} className={`${className} hover:border-primary hover:text-primary`}>
      {direction === 'prev' && <Icon className="size-4" aria-hidden="true" />}
      {label}
      {direction === 'next' && <Icon className="size-4" aria-hidden="true" />}
    </Link>
  )
}
