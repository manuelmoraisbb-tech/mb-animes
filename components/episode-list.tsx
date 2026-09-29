import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Season } from '@/lib/catalog'
import { cn } from '@/lib/utils'

export function EpisodeList({
  slug,
  season,
  currentEpisode,
  compact = false,
}: {
  slug: string
  season: Season
  poster?: string
  currentEpisode?: number
  compact?: boolean
}) {
  return (
    <ol
      className={cn(
        'grid gap-2',
        compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {season.episodes.map((ep) => {
        const active = ep.number === currentEpisode
        return (
          <li key={ep.number}>
            <Link
              href={`/assistir/${slug}/${season.number}/${ep.number}`}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-4 rounded-lg border p-3 transition',
                active ? 'border-primary bg-primary/10' : 'bg-card hover:border-primary/60',
              )}
            >
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-md font-heading text-sm font-bold tabular-nums',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground',
                )}
              >
                <span className="group-hover:hidden">{String(ep.number).padStart(2, '0')}</span>
                <Play className="hidden size-4 fill-current group-hover:block" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium">{`Episódio ${ep.number}`}</span>
                <span className="truncate text-xs text-muted-foreground">{ep.name}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
