'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react'
import { ExternalPlayers } from '@/components/external-players'

const STALL_TIMEOUT_MS = 20_000

type Source = { label: string; url: string }

function buildSources(proxyUrl: string, directUrl: string): Source[] {
  const sources: Source[] = [{ label: 'Servidor MB Animes', url: proxyUrl }]
  if (directUrl !== proxyUrl) sources.push({ label: 'Link direto', url: directUrl })
  if (directUrl.startsWith('http://')) {
    sources.push({ label: 'Link direto seguro (HTTPS)', url: directUrl.replace(/^http:/, 'https:') })
  }
  return sources
}

export function VideoPlayer({
  src,
  directUrl,
  poster,
  title,
  nextHref,
}: {
  src: string
  directUrl: string
  poster: string
  title: string
  nextHref: string | null
}) {
  return (
    <div className="flex flex-col gap-6">
      <InlinePlayer src={src} directUrl={directUrl} poster={poster} title={title} nextHref={nextHref} />
      <ExternalPlayers url={directUrl} title={title} />
    </div>
  )
}

function InlinePlayer({
  src,
  directUrl,
  poster,
  title,
  nextHref,
}: {
  src: string
  directUrl: string
  poster: string
  title: string
  nextHref: string | null
}) {
  const router = useRouter()
  const sources = useMemo(() => buildSources(src, directUrl), [src, directUrl])
  const [index, setIndex] = useState(0)
  const [round, setRound] = useState(0)
  const [ready, setReady] = useState(false)

  const exhausted = index >= sources.length
  const current = sources[index]
  const tryNext = () => {
    setReady(false)
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    if (exhausted || ready) return
    const timer = setTimeout(tryNext, STALL_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [index, round, ready, exhausted])

  if (exhausted) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-xl bg-card p-6 text-center ring-1 ring-border">
        <AlertTriangle className="size-8 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="font-heading text-lg font-semibold">O vídeo não abriu aqui dentro</p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
            O servidor do vídeo bloqueia reprodução embutida. Use um player externo logo abaixo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIndex(0)
            setReady(false)
            setRound((r) => r + 1)
          }}
          className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Tentar de novo
        </button>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-card ring-1 ring-border">
      <video
        key={`${round}-${index}`}
        src={current.url}
        poster={poster}
        controls
        autoPlay
        playsInline
        preload="metadata"
        aria-label={title}
        onLoadedMetadata={() => setReady(true)}
        onError={tryNext}
        onEnded={() => nextHref && router.push(nextHref)}
        className="h-full w-full bg-background object-contain"
      />
      {!ready && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center px-4"
        >
          <span className="flex items-center gap-2 rounded-full bg-background/85 px-4 py-2 text-sm text-foreground ring-1 ring-border backdrop-blur">
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
            {`Método ${index + 1} de ${sources.length}: ${current.label}`}
          </span>
        </div>
      )}
    </div>
  )
}
