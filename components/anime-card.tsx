import Link from 'next/link'
import Image from 'next/image'
import type { AnimeSummary } from '@/lib/catalog'
import { cn } from '@/lib/utils'

export function AnimeCard({
  anime,
  className,
  priority = false,
}: {
  anime: AnimeSummary
  className?: string
  priority?: boolean
}) {
  return (
    <Link
      href={`/anime/${anime.slug}`}
      className={cn('group flex flex-col gap-2 focus-visible:outline-none', className)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-card ring-1 ring-border transition group-hover:ring-primary group-focus-visible:ring-2 group-focus-visible:ring-primary">
        <Image
          src={anime.poster || '/placeholder.svg'}
          alt={`Pôster de ${anime.title}`}
          fill
          sizes="(min-width: 1280px) 180px, (min-width: 768px) 20vw, 45vw"
          priority={priority}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 left-2 rounded bg-background/85 px-1.5 py-0.5 text-xs font-medium text-foreground backdrop-blur">
          {anime.totalEpisodes} ep
        </span>
        {anime.seasonCount > 1 && (
          <span className="absolute right-2 top-2 rounded bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {anime.seasonCount} temp.
          </span>
        )}
      </div>
      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-pretty text-foreground/90 group-hover:text-foreground">
        {anime.title}
      </h3>
    </Link>
  )
}
