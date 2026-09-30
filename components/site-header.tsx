import Link from 'next/link'
import { HeaderSearch } from '@/components/header-search'
import { Logo } from '@/components/logo'
import { UserMenu } from '@/components/user-menu'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-card">
      <div className="relative mx-auto flex h-15 max-w-screen-2xl items-center gap-2 px-4 md:px-8">
        <Logo />
        <nav aria-label="Principal" className="ml-4 hidden items-stretch self-stretch md:flex">
          <HeaderLink href="/">Novidades</HeaderLink>
          <HeaderLink href="/catalogo">Navegar</HeaderLink>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <HeaderSearch />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 text-sm font-bold text-muted-foreground transition hover:bg-background hover:text-foreground"
    >
      {children}
    </Link>
  )
}
