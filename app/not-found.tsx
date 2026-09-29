import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-6xl font-bold text-primary">404</p>
      <h1 className="font-heading text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground">Esse anime ou episódio não existe no catálogo.</p>
      <Link
        href="/catalogo"
        className="flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
      >
        Ir para o catálogo
      </Link>
    </div>
  )
}
