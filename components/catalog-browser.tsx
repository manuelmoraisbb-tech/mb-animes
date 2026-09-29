'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { AnimeCard } from '@/components/anime-card'
import type { AnimeSummary } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]
type Sort = 'az' | 'eps' | 'seasons'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function firstLetter(title: string) {
  const c = normalize(title).charAt(0).toUpperCase()
  return c >= 'A' && c <= 'Z' ? c : '#'
}

export function CatalogBrowser({
  animes,
  initialQuery,
}: {
  animes: AnimeSummary[]
  initialQuery: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [letter, setLetter] = useState<string | null>(null)
  const [sort, setSort] = useState<Sort>('az')
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(() => {
    const q = normalize(deferredQuery.trim())
    const filtered = animes.filter(
      (a) =>
        (!q || normalize(a.title).includes(q)) && (!letter || firstLetter(a.title) === letter),
    )
    if (sort === 'eps') return [...filtered].sort((a, b) => b.totalEpisodes - a.totalEpisodes)
    if (sort === 'seasons') return [...filtered].sort((a, b) => b.seasonCount - a.seasonCount)
    return filtered
  }, [animes, deferredQuery, letter, sort])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <label htmlFor="catalog-search" className="sr-only">
            Filtrar por nome
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="catalog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar por nome..."
            className="h-11 w-full rounded-lg border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Ordenar
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-11 rounded-lg border bg-card px-3 text-sm text-foreground"
          >
            <option value="az">A–Z</option>
            <option value="eps">Mais episódios</option>
            <option value="seasons">Mais temporadas</option>
          </select>
        </label>
      </div>

      <div role="group" aria-label="Filtrar por letra" className="no-scrollbar flex gap-1 overflow-x-auto">
        <LetterButton active={letter === null} onClick={() => setLetter(null)}>
          Todos
        </LetterButton>
        {LETTERS.map((l) => (
          <LetterButton key={l} active={letter === l} onClick={() => setLetter(letter === l ? null : l)}>
            {l}
          </LetterButton>
        ))}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {`${results.length} resultado${results.length === 1 ? '' : 's'}`}
      </p>

      {results.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map((anime, i) => (
            <li key={anime.slug}>
              <AnimeCard anime={anime} priority={i < 6} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="font-heading text-lg font-semibold">Nenhum anime encontrado</p>
          <p className="text-sm text-muted-foreground">Tente outro nome ou limpe os filtros.</p>
        </div>
      )}
    </div>
  )
}

function LetterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-9 min-w-9 shrink-0 rounded-md px-2.5 text-sm font-medium transition',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
