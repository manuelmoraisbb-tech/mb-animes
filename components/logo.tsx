import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" aria-label="MB Animes — início" className="flex items-center gap-2 text-primary">
      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
        MB
      </span>
      <span className="text-lg font-black uppercase tracking-tight">
        MB Animes
      </span>
    </Link>
  )
}
