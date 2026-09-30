'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, X } from 'lucide-react'

export function HeaderSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    startTransition(() => {
      router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo')
    })
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar animes"
        className="flex size-11 items-center justify-center text-muted-foreground transition hover:bg-background hover:text-foreground"
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="size-5" aria-hidden="true" />
        )}
      </button>
    )
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className="absolute inset-x-0 top-0 z-10 flex h-15 items-center gap-2 bg-card px-4 md:static md:h-auto md:bg-transparent md:px-0"
    >
      <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <label htmlFor="header-search" className="sr-only">
        Buscar animes
      </label>
      <input
        ref={inputRef}
        id="header-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="Buscar animes..."
        enterKeyHint="search"
        className="h-10 min-w-0 flex-1 border-b-2 border-primary bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:w-64"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Fechar busca"
        className="flex size-11 shrink-0 items-center justify-center text-muted-foreground transition hover:text-foreground"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </form>
  )
}
