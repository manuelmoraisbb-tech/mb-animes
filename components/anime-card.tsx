import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import type { AnimeSummary } from '@/lib/catalog'

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

export function AnimeCard({ anime, priority = false }: { anime: AnimeSummary; priority?: boolean }) {
  return (
    <Link
      href={`/anime/${anime.slug}`}
      className="group relative flex flex-col gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-card">
        <Image
          src={anime.poster}
          alt={`Pôster de ${anime.title}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 45vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">{anime.title}</h3>
        <p className="text-xs text-muted-foreground">Legendado</p>
      </div>

      {/* Crunchyroll-style hover panel that covers poster and text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden flex-col gap-2 bg-card/95 p-3 opacity-0 transition duration-200 group-hover:opacity-100 md:flex"
      >
        <p className="line-clamp-3 text-sm font-bold leading-snug">{anime.title}</p>
        <p className="text-xs text-muted-foreground">
          {plural(anime.seasonCount, 'temporada', 'temporadas')}
        </p>
        <p className="text-xs text-muted-foreground">
          {plural(anime.totalEpisodes, 'episódio', 'episódios')}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Assista agora no MB Animes, legendado, do primeiro ao último episódio.
        </p>
        <span className="mt-auto flex size-9 items-center justify-center text-primary">
          <Play className="size-6 fill-current" />
        </span>
      </div>
    </Link>
  )
}
