'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  ListVideo,
  Loader2,
  MonitorPlay,
  RotateCcw,
  Smartphone,
} from 'lucide-react'

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
      <PlaybackFallback
        directUrl={directUrl}
        title={title}
        onRetry={() => {
          setIndex(0)
          setReady(false)
          setRound((r) => r + 1)
        }}
      />
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

function PlaybackFallback({
  directUrl,
  title,
  onRetry,
}: {
  directUrl: string
  title: string
  onRetry: () => void
}) {
  const [copied, setCopied] = useState(false)
  const withoutScheme = directUrl.replace(/^https?:\/\//, '')
  const scheme = directUrl.startsWith('https') ? 'https' : 'http'
  const playlistHref = `data:audio/x-mpegurl;charset=utf-8,${encodeURIComponent(
    `#EXTM3U\n#EXTINF:-1,${title}\n${directUrl}\n`,
  )}`

  const options = [
    { href: directUrl, label: 'Abrir no navegador', icon: ExternalLink, newTab: true },
    { href: `vlc://${directUrl}`, label: 'Abrir no VLC', icon: MonitorPlay },
    {
      href: `intent://${withoutScheme}#Intent;scheme=${scheme};type=video/*;end`,
      label: 'Player do Android',
      icon: Smartphone,
    },
    {
      href: `vlc-x-callback://x-callback-url/stream?url=${encodeURIComponent(directUrl)}`,
      label: 'VLC no iPhone',
      icon: Smartphone,
    },
    { href: playlistHref, label: 'Baixar playlist .m3u', icon: ListVideo, download: 'episodio.m3u' },
    { href: directUrl, label: 'Baixar episódio', icon: Download, download: '' },
  ]

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-5 overflow-y-auto rounded-xl bg-card p-6 text-center ring-1 ring-border">
      <AlertTriangle className="size-8 shrink-0 text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="font-heading text-lg font-semibold">O vídeo não abriu aqui dentro</p>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty">
          O servidor do vídeo bloqueia reprodução embutida. Escolha uma das opções abaixo: elas
          abrem o episódio direto da sua conexão.
        </p>
      </div>
      <ul className="grid w-full max-w-xl grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map(({ href, label, icon: Icon, newTab, download }) => (
          <li key={label}>
            <a
              href={href}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
              download={download}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(directUrl).catch(() => {})
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-semibold hover:bg-background"
        >
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? 'Link copiado' : 'Copiar link'}
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Tentar de novo
        </button>
      </div>
    </div>
  )
}
