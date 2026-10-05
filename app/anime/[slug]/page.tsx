import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Play } from 'lucide-react'
import { AnimeRow } from '@/components/anime-row'
import { SeasonTabs } from '@/components/season-tabs'
import { EpisodeList } from '@/components/episode-list'
import { Comments } from '@/components/comments'
import { getAllAnimes, getLiveAnimeBySlug, getRelated, toSummary } from '@/lib/catalog'

export function generateStaticParams() {
  return getAllAnimes().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const anime = await getLiveAnimeBySlug(slug)
  if (!anime) return { title: 'Anime não encontrado' }
  return {
    title: anime.title,
    description: `Assista ${anime.title} online: ${anime.seasons.length} temporada(s), ${anime.totalEpisodes} episódios.`,
    openGraph: { images: [anime.poster] },
  }
}

export default async function AnimePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const [{ slug }, { t }] = await Promise.all([params, searchParams])
  const anime = await getLiveAnimeBySlug(slug)
  if (!anime) notFound()

  const season = anime.seasons.find((s) => String(s.number) === t) ?? anime.seasons[0]
  const first = anime.seasons[0]?.episodes[0]

  return (
    <div className="flex flex-col gap-12">
      <section className="relative isolate overflow-hidden">
        <Image
          src={anime.poster}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="-z-10 scale-110 object-cover opacity-40 blur-2xl"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 pb-10 pt-8 md:flex-row md:items-end md:px-8 md:pt-16">
          <div className="relative aspect-[2/3] w-44 shrink-0 overflow-hidden shadow-2xl md:w-60">
            <Image src={anime.poster} alt={`Pôster de ${anime.title}`} fill priority sizes="240px" className="object-cover" />
          </div>
          <div className="hero-in flex max-w-2xl flex-col gap-4">
            <h1 className="text-3xl font-black leading-tight text-balance md:text-5xl">{anime.title}</h1>
            <p className="text-sm text-muted-foreground">
              {`Dublado/Legendado · ${anime.seasons.length} temporada${anime.seasons.length > 1 ? 's' : ''} · ${anime.totalEpisodes} episódios`}
            </p>
            {first && (
              <Link
                href={`/assistir/${anime.slug}/${anime.seasons[0].number}/${first.number}`}
                className="flex h-11 w-fit items-center gap-2 bg-primary px-5 text-sm font-black uppercase text-primary-foreground transition hover:brightness-110"
              >
                <Play className="size-5 fill-current" aria-hidden="true" />
                Começar a assistir T1 E1
              </Link>
            )}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="episodes-heading"
        className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 md:px-8"
      >
        <h2 id="episodes-heading" className="text-xl font-black md:text-2xl">
          Episódios
        </h2>
        {anime.seasons.length > 1 && (
          <SeasonTabs slug={anime.slug} seasons={anime.seasons.map((s) => s.number)} current={season.number} />
        )}
        <EpisodeList slug={anime.slug} season={season} poster={anime.poster} />
      </section>

      <AnimeRow title="Você também pode curtir" animes={getRelated(anime, 14).map(toSummary)} />

      <div className="mx-auto w-full max-w-4xl px-4 md:px-8">
        <Comments animeSlug={anime.slug} episodeKey={null} />
      </div>
    </div>
  )
}
