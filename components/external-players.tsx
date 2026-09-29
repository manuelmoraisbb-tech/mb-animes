'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Download, ExternalLink, ListVideo, Monitor, Smartphone, Tablet } from 'lucide-react'

type Platform = 'android' | 'ios' | 'pc'

type PlayerLink = {
  label: string
  href: string
  hint?: string
  download?: string
  newTab?: boolean
}

function androidIntent(url: string, title: string, pkg?: string) {
  const scheme = url.startsWith('https') ? 'https' : 'http'
  const rest = url.replace(/^https?:\/\//, '')
  const packagePart = pkg ? `package=${pkg};` : ''
  return `intent://${rest}#Intent;scheme=${scheme};type=video/*;${packagePart}S.title=${encodeURIComponent(title)};end`
}

function buildPlayers(url: string, title: string): Record<Platform, PlayerLink[]> {
  const encoded = encodeURIComponent(url)
  const rest = url.replace(/^https?:\/\//, '')
  const playlist = `data:audio/x-mpegurl;charset=utf-8,${encodeURIComponent(
    `#EXTM3U\n#EXTINF:-1,${title}\n${url}\n`,
  )}`

  return {
    android: [
      { label: 'Escolher player', href: androidIntent(url, title), hint: 'Mostra os apps instalados' },
      { label: 'VLC', href: androidIntent(url, title, 'org.videolan.vlc') },
      { label: 'MX Player', href: androidIntent(url, title, 'com.mxtech.videoplayer.ad') },
      { label: 'MX Player Pro', href: androidIntent(url, title, 'com.mxtech.videoplayer.pro') },
      { label: 'Just Player', href: androidIntent(url, title, 'com.brouken.player') },
      { label: 'mpv', href: androidIntent(url, title, 'is.xyz.mpv') },
    ],
    ios: [
      { label: 'VLC', href: `vlc-x-callback://x-callback-url/stream?url=${encoded}` },
      { label: 'Infuse', href: `infuse://x-callback-url/play?url=${encoded}` },
      { label: 'nPlayer', href: `nplayer-${url.startsWith('https') ? 'https' : 'http'}://${rest}` },
      { label: 'Outplayer', href: `outplayer://${url}` },
      { label: 'SenPlayer', href: `SenPlayer://x-callback-url/play?url=${encoded}` },
    ],
    pc: [
      { label: 'VLC', href: `vlc://${url}` },
      { label: 'PotPlayer', href: `potplayer://${url}`, hint: 'Windows' },
      { label: 'IINA', href: `iina://weblink?url=${encoded}`, hint: 'macOS' },
      { label: 'Abrir no navegador', href: url, newTab: true },
      { label: 'Playlist .m3u', href: playlist, download: 'episodio.m3u', hint: 'Abre em qualquer player' },
      { label: 'Baixar episódio', href: url, download: '' },
    ],
  }
}

const tabs: { id: Platform; label: string; icon: typeof Smartphone }[] = [
  { id: 'android', label: 'Android', icon: Smartphone },
  { id: 'ios', label: 'iPhone/iPad', icon: Tablet },
  { id: 'pc', label: 'PC/Mac', icon: Monitor },
]

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'android'
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  return 'pc'
}

export function ExternalPlayers({ url, title }: { url: string; title: string }) {
  const [platform, setPlatform] = useState<Platform>('android')
  const [copied, setCopied] = useState(false)

  useEffect(() => setPlatform(detectPlatform()), [])
  const players = buildPlayers(url, title)[platform]

  return (
    <section aria-labelledby="external-players-title" className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="external-players-title" className="font-heading text-base font-semibold">
            Assistir em player externo
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            O vídeo toca direto da sua internet, no app que você preferir.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(url).catch(() => {})
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium hover:border-primary hover:text-primary"
        >
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? 'Link copiado' : 'Copiar link'}
        </button>
      </div>

      <div role="tablist" aria-label="Dispositivo" className="flex gap-1 rounded-full bg-secondary p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={platform === id}
            onClick={() => setPlatform(id)}
            className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium transition ${
              platform === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      <ul role="tabpanel" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {players.map(({ label, href, hint, download, newTab }) => {
          const Icon = download === 'episodio.m3u' ? ListVideo : download !== undefined ? Download : ExternalLink
          return (
            <li key={label}>
              <a
                href={href}
                download={download}
                target={newTab ? '_blank' : undefined}
                rel={newTab ? 'noopener noreferrer' : undefined}
                className="flex h-full min-h-14 flex-col justify-center gap-0.5 rounded-lg border bg-card px-3 py-2 transition hover:border-primary"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </span>
                {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
              </a>
            </li>
          )
        })}
      </ul>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {'Se nada acontecer ao tocar, o app não está instalado. Use "Copiar link" e cole no app.'}
      </p>
    </section>
  )
}
