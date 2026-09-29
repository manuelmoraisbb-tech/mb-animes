import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { AnimeCard } from '@/components/anime-card'
import type { AnimeSummary } from '@/lib/catalog'

export function AnimeRow({
  title,
  description,
  animes,
  href,
}: {
  title: string
  description?: string
  animes: AnimeSummary[]
  href?: string
}) {
  if (animes.length === 0) return null
  return (
    <section aria-labelledby={`row-${title}`} className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4 px-4 md:px-6">
        <div className="flex flex-col gap-1">
          <h2 id={`row-${title}`} className="font-heading text-xl font-semibold md:text-2xl">
            {title}
          </h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            Ver tudo
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      <ul className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:px-6">
        {animes.map((anime) => (
          <li key={anime.slug} className="w-36 shrink-0 snap-start md:w-44">
            <AnimeCard anime={anime} />
          </li>
        ))}
      </ul>
    </section>
  )
}
