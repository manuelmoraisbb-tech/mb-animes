import Link from 'next/link'

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
    <nav aria-label="Temporadas" className="no-scrollbar flex overflow-x-auto border-b">
      {seasons.map((n) => {
        const active = n === current
        return (
          <Link
            key={n}
            href={`/anime/${slug}?t=${n}`}
            scroll={false}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold uppercase transition ${
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {`Temporada ${n}`}
          </Link>
        )
      })}
    </nav>
  )
}
