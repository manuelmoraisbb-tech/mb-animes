import Link from 'next/link'
import { Logo } from '@/components/logo'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <Logo />
        <nav aria-label="Rodapé" className="flex gap-6">
          <Link href="/" className="hover:text-foreground">
            Início
          </Link>
          <Link href="/catalogo" className="hover:text-foreground">
            Catálogo
          </Link>
        </nav>
        <p>{`© ${new Date().getFullYear()} MB Animes`}</p>
      </div>
    </footer>
  )
}
