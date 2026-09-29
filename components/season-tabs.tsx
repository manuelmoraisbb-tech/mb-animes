import Link from 'next/link'
import { cn } from '@/lib/utils'

export function SeasonTabs({
  slug,
  seasons,
  current,
}: {
  slug: string
  seasons: number[]
  current: number
}) {
  return (
    <nav aria-label="Temporadas" className="no-scrollbar flex gap-2 overflow-x-auto">
      {seasons.map((n) => (
        <Link
          key={n}
          href={`/anime/${slug}?t=${n}`}
          scroll={false}
          aria-current={n === current ? 'page' : undefined}
          className={cn(
            'flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition',
            n === current
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:text-foreground',
          )}
        >
          {`Temporada ${n}`}
        </Link>
      ))}
    </nav>
  )
}
