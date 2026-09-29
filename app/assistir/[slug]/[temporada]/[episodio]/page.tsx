import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VideoPlayer } from '@/components/video-player'
import { EpisodeList } from '@/components/episode-list'
import { Comments } from '@/components/comments'
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
    <div className="flex flex-col">
      <div className="bg-background">
        <div className="mx-auto max-w-6xl">
          <VideoPlayer
            key={episode.url}
            src={getPlayableUrl(episode.url)}
            poster={anime.poster}
            title={episode.name}
            nextHref={nextHref}
          />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-screen-2xl gap-10 px-4 py-8 md:px-8 lg:grid-cols-[1fr_24rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <div className="flex flex-col gap-4 border-b pb-6">
            <Link
              href={`/anime/${slug}`}
              className="w-fit text-sm font-bold text-primary hover:underline"
            >
              {anime.title}
            </Link>
            <h1 className="text-2xl font-black leading-tight text-balance">
              {`T${season.number} E${episode.number} — ${episode.name}`}
            </h1>
            <p className="text-sm text-muted-foreground">Legendado</p>
            <div className="flex gap-2">
              <NavButton href={prevHref} direction="prev" />
              <NavButton href={nextHref} direction="next" />
            </div>
          </div>
          <Comments animeSlug={slug} episodeKey={`${season.number}-${episode.number}`} />
        </div>

        <aside aria-label={`Episódios da temporada ${season.number}`} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">{`Temporada ${season.number}`}</h2>
            {anime.seasons.length > 1 && (
              <Link
                href={`/anime/${slug}?t=${season.number}`}
                className="text-sm font-bold text-muted-foreground hover:text-foreground"
              >
                Outras temporadas
              </Link>
            )}
          </div>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <EpisodeList
              slug={slug}
              season={season}
              poster={anime.poster}
              currentEpisode={episode.number}
              compact
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

function NavButton({ href, direction }: { href: string | null; direction: 'prev' | 'next' }) {
  const label = direction === 'prev' ? 'Anterior' : 'Próximo episódio'
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  const className =
    'flex h-10 items-center gap-1 border-2 px-4 text-xs font-black uppercase transition'
  const content = (
    <>
      {direction === 'prev' && <Icon className="size-4" aria-hidden="true" />}
      {label}
      {direction === 'next' && <Icon className="size-4" aria-hidden="true" />}
    </>
  )
  if (!href) {
    return (
      <span aria-disabled="true" className={`${className} cursor-not-allowed border-border text-muted-foreground opacity-50`}>
        {content}
      </span>
    )
  }
  return (
    <Link href={href} className={`${className} border-primary text-primary hover:bg-primary/10`}>
      {content}
    </Link>
  )
}
