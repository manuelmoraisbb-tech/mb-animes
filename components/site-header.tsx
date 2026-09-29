import Link from 'next/link'
import { Search } from 'lucide-react'
import { Logo } from '@/components/logo'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:gap-8 md:px-6">
        <Link href="/" aria-label="MB Animes — início" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
            Início
          </Link>
          <Link href="/catalogo" className="text-muted-foreground transition-colors hover:text-foreground">
            Catálogo
          </Link>
        </nav>

        <form action="/catalogo" role="search" className="ml-auto w-full max-w-xs">
          <label htmlFor="header-search" className="sr-only">
            Buscar anime
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Buscar anime..."
              className="h-10 w-full rounded-full border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
            />
          </div>
        </form>
      </div>
    </header>
  )
}
