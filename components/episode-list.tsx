import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Season } from '@/lib/catalog'

export function EpisodeList({
  slug,
  season,
  poster,
  currentEpisode,
  compact = false,
}: {
  slug: string
  season: Season
  poster: string
  currentEpisode?: number
  compact?: boolean
}) {
  return (
    <ul
      className={
        compact
          ? 'flex flex-col gap-3'
          : 'grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }
    >
      {season.episodes.map((ep) => {
        const active = ep.number === currentEpisode
        return (
          <li key={ep.number}>
            <Link
              href={`/assistir/${slug}/${season.number}/${ep.number}`}
              aria-current={active ? 'page' : undefined}
              className={`group flex gap-3 ${compact ? 'flex-row items-start p-1' : 'flex-col'} ${active ? 'bg-card' : ''}`}
            >
              <div
                className={`relative aspect-video shrink-0 overflow-hidden bg-card ${compact ? 'w-36' : 'w-full'}`}
              >
                <Image
                  src={poster}
                  alt=""
                  fill
                  sizes={compact ? '144px' : '(min-width: 1024px) 25vw, 100vw'}
                  className="object-cover object-top transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition group-hover:opacity-100">
                  <Play className="size-8 fill-foreground text-foreground" aria-hidden="true" />
                </div>
                {active && (
                  <span className="absolute bottom-1 left-1 bg-primary px-1.5 py-0.5 text-[11px] font-black uppercase text-primary-foreground">
                    Assistindo
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-xs font-bold text-muted-foreground">{`T${season.number} E${ep.number}`}</p>
                <h3
                  className={`line-clamp-2 text-sm font-bold leading-snug transition group-hover:text-primary ${active ? 'text-primary' : ''}`}
                >
                  {ep.name}
                </h3>
                {!compact && <p className="text-xs text-muted-foreground">Dublado/Legendado</p>}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
