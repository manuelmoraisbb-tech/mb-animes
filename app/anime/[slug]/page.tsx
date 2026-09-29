import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Play } from 'lucide-react'
import { AnimeRow } from '@/components/anime-row'
import { SeasonTabs } from '@/components/season-tabs'
import { EpisodeList } from '@/components/episode-list'
import { getAllAnimes, getAnimeBySlug, getRelated, toSummary } from '@/lib/catalog'

export function generateStaticParams() {
  return getAllAnimes().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const anime = getAnimeBySlug(slug)
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
  const anime = getAnimeBySlug(slug)
  if (!anime) notFound()

  const season = anime.seasons.find((s) => String(s.number) === t) ?? anime.seasons[0]
  const first = anime.seasons[0]?.episodes[0]

  return (
    <div className="flex flex-col gap-12">
      <section className="relative isolate overflow-hidden border-b">
        <Image
          src={anime.poster}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="-z-10 scale-110 object-cover opacity-20 blur-2xl"
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:flex-row md:items-end md:px-6 md:py-14">
          <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl ring-1 ring-border shadow-2xl md:w-56">
            <Image
              src={anime.poster}
              alt={`Pôster de ${anime.title}`}
              fill
              priority
              sizes="224px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-4">
            <nav aria-label="Trilha" className="text-sm text-muted-foreground">
              <Link href="/catalogo" className="hover:text-foreground">
                Catálogo
              </Link>
              <span aria-hidden="true">{' / '}</span>
              <span className="text-foreground">{anime.title}</span>
            </nav>
            <h1 className="font-heading text-3xl font-bold leading-tight text-balance md:text-5xl">
              {anime.title}
            </h1>
            <p className="text-muted-foreground">
              {`${anime.seasons.length} temporada${anime.seasons.length > 1 ? 's' : ''} · ${anime.totalEpisodes} episódios`}
            </p>
            {first && (
              <Link
                href={`/assistir/${anime.slug}/${anime.seasons[0].number}/${first.number}`}
                className="flex h-11 w-fit items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                Assistir episódio 1
              </Link>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="episodes-heading" className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 id="episodes-heading" className="font-heading text-2xl font-semibold">
            Episódios
          </h2>
          {anime.seasons.length > 1 && (
            <SeasonTabs slug={anime.slug} seasons={anime.seasons.map((s) => s.number)} current={season.number} />
          )}
        </div>
        <EpisodeList slug={anime.slug} season={season} poster={anime.poster} />
      </section>

      <AnimeRow title="Você também pode curtir" animes={getRelated(anime, 14).map(toSummary)} />
    </div>
  )
}
