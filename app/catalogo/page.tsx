import type { Metadata } from 'next'
import { CatalogBrowser } from '@/components/catalog-browser'
import { getAllSummaries } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Todos os animes disponíveis no MB Animes, de A a Z.',
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const animes = getAllSummaries()

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">Catálogo</h1>
        <p className="text-muted-foreground">{`${animes.length} animes para explorar.`}</p>
      </header>
      <CatalogBrowser key={q ?? ''} animes={animes} initialQuery={q ?? ''} />
    </div>
  )
}
