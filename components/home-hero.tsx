import Link from 'next/link'
import Image from 'next/image'
import { Play, LayoutGrid } from 'lucide-react'
import type { Anime } from '@/lib/catalog'

function PosterWall({ images }: { images: string[] }) {
  const columns = 7
  const perColumn = 6
  const cols = Array.from({ length: columns }, (_, c) =>
    Array.from({ length: perColumn }, (_, r) => images[(c * perColumn + r) % images.length]),
  )

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex -rotate-6 scale-125 gap-3 opacity-35"
    >
      {cols.map((col, i) => (
        <div
          key={i}
          data-reverse={i % 2 === 1}
          className="poster-column flex w-1/4 shrink-0 flex-col gap-3 md:w-[14%]"
          style={{ ['--drift-duration' as string]: `${55 + (i % 3) * 12}s` }}
        >
          {[...col, ...col].map((src, j) => (
            <div key={j} className="relative aspect-[2/3] shrink-0 overflow-hidden rounded-md bg-card">
              <Image src={src} alt="" fill sizes="180px" className="object-cover" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function HomeHero({
  featured,
  wall,
  stats,
}: {
  featured: Anime
  wall: string[]
  stats: { animes: number; episodes: number }
}) {
  const firstSeason = featured.seasons[0]
  const firstEpisode = firstSeason?.episodes[0]

  return (
    <section className="relative isolate overflow-hidden border-b">
      <PosterWall images={wall} />
      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:justify-between md:px-6 md:py-24">
        <div className="flex max-w-xl flex-col gap-6">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            {`${stats.animes} animes · ${stats.episodes.toLocaleString('pt-BR')} episódios`}
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight text-balance md:text-6xl">
            Seu próximo anime favorito começa aqui.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Escolha uma série, abra a temporada e dê play. Sem cadastro, sem enrolação.
          </p>
          <div className="flex flex-wrap gap-3">
            {firstEpisode && (
              <Link
                href={`/assistir/${featured.slug}/${firstSeason.number}/${firstEpisode.number}`}
                className="flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                {`Assistir ${featured.title.length > 28 ? 'destaque' : featured.title}`}
              </Link>
            )}
            <Link
              href="/catalogo"
              className="flex h-11 items-center gap-2 rounded-full border bg-card/60 px-6 text-sm font-semibold backdrop-blur transition hover:bg-card"
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
              Ver catálogo
            </Link>
          </div>
        </div>

        <Link
          href={`/anime/${featured.slug}`}
          className="group relative hidden w-64 shrink-0 flex-col gap-3 md:flex"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-border shadow-2xl transition group-hover:ring-primary">
            <Image
              src={featured.poster}
              alt={`Pôster de ${featured.title}`}
              fill
              priority
              sizes="256px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-widest text-primary">Destaque do dia</span>
            <span className="font-heading font-semibold text-pretty">{featured.title}</span>
            <span className="text-sm text-muted-foreground">
              {`${featured.seasons.length} temporada${featured.seasons.length > 1 ? 's' : ''} · ${featured.totalEpisodes} episódios`}
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}
