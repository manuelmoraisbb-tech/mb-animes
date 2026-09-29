'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimeCard } from '@/components/anime-card'
import type { AnimeSummary } from '@/lib/catalog'

export function AnimeRow({
  title,
  subtitle,
  animes,
}: {
  title: string
  subtitle?: string
  animes: AnimeSummary[]
}) {
  const scroller = useRef<HTMLUListElement>(null)

  if (animes.length === 0) return null

  function scroll(direction: 1 | -1) {
    const el = scroller.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <section className="group/row flex flex-col gap-4">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-1 px-4 md:px-8">
        <h2 className="text-xl font-black md:text-2xl">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="relative mx-auto w-full max-w-screen-2xl">
        <ul
          ref={scroller}
          className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-px-4 px-4 md:scroll-px-8 md:px-8"
        >
          {animes.map((anime) => (
            <li key={anime.slug} className="w-36 shrink-0 snap-start sm:w-44 lg:w-48">
              <AnimeCard anime={anime} />
            </li>
          ))}
        </ul>
        <ScrollButton direction={-1} onClick={() => scroll(-1)} />
        <ScrollButton direction={1} onClick={() => scroll(1)} />
      </div>
    </section>
  )
}

function ScrollButton({ direction, onClick }: { direction: 1 | -1; onClick: () => void }) {
  const Icon = direction === 1 ? ChevronRight : ChevronLeft
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 1 ? 'Ver mais' : 'Voltar'}
      className={`absolute top-0 hidden h-[calc(100%-3.5rem)] w-12 items-center justify-center from-background to-transparent opacity-0 transition group-hover/row:opacity-100 md:flex ${
        direction === 1 ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'
      }`}
    >
      <Icon className="size-8" aria-hidden="true" />
    </button>
  )
}
