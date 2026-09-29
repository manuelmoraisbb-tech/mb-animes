import Link from 'next/link'
import { Logo } from '@/components/logo'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-10 px-4 py-12 md:flex-row md:justify-between md:px-8">
        <div className="flex max-w-sm flex-col gap-3">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Seu lugar para maratonar animes, temporada por temporada, e conversar com a comunidade nos comentários.
          </p>
        </div>
        <div className="flex gap-16">
          <FooterColumn title="Navegação">
            <FooterLink href="/">Novidades</FooterLink>
            <FooterLink href="/catalogo">Navegar</FooterLink>
          </FooterColumn>
          <FooterColumn title="Conta">
            <FooterLink href="/auth/login">Entrar</FooterLink>
            <FooterLink href="/auth/sign-up">Criar conta</FooterLink>
          </FooterColumn>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-screen-2xl px-4 py-5 text-xs text-muted-foreground md:px-8">
          {`© ${new Date().getFullYear()} MB Animes`}
        </p>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-bold">{title}</h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted-foreground transition hover:text-foreground">
        {children}
      </Link>
    </li>
  )
}
