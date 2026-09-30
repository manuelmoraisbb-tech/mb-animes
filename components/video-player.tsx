'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  Download,
  Gauge,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const HIDE_DELAY = 2800

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`
}

type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

export function VideoPlayer({
  src,
  poster,
  title,
  subtitle,
  nextHref,
  downloadHref,
}: {
  src: string
  poster: string
  title: string
  subtitle: string
  nextHref: string | null
  downloadHref: string
}) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<WebkitVideo>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [attempt, setAttempt] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [waiting, setWaiting] = useState(true)
  const [failed, setFailed] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [speedOpen, setSpeedOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [flash, setFlash] = useState<{ key: number; label: string } | null>(null)

  const showControls = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false)
        setSpeedOpen(false)
      }
    }, HIDE_DELAY)
  }, [])

  const showFlash = (label: string) => setFlash({ key: Date.now(), label })

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }, [])

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current
    if (!v || !Number.isFinite(v.duration)) return
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration)
    showFlash(delta > 0 ? `+${delta}s` : `${delta}s`)
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    if (!v.muted && v.volume === 0) v.volume = 0.5
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    const v = videoRef.current
    if (!el || !v) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => v.webkitEnterFullscreen?.())
    } else {
      v.webkitEnterFullscreen?.()
    }
  }, [])

  const togglePip = async () => {
    const v = videoRef.current
    if (!v) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await v.requestPictureInPicture()
    } catch {}
  }

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      clearTimeout(hideTimer.current)
      clearTimeout(clickTimer.current)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      const key = e.key.toLowerCase()
      const handled = [' ', 'k', 'f', 'm', 'arrowleft', 'arrowright', 'j', 'l'].includes(key)
      if (!handled) return
      e.preventDefault()
      showControls()
      if (key === ' ' || key === 'k') togglePlay()
      else if (key === 'f') toggleFullscreen()
      else if (key === 'm') toggleMute()
      else if (key === 'arrowleft' || key === 'j') seekBy(-10)
      else if (key === 'arrowright' || key === 'l') seekBy(10)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seekBy, showControls, toggleFullscreen, toggleMute, togglePlay])

  const handleSurfaceClick = () => {
    clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(togglePlay, 220)
  }
  const handleSurfaceDoubleClick = () => {
    clearTimeout(clickTimer.current)
    toggleFullscreen()
  }

  const retry = () => {
    setFailed(false)
    setWaiting(true)
    setAttempt((n) => n + 1)
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0
  const effectiveVolume = muted ? 0 : volume
  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2
  const hideUi = !controlsVisible && playing

  return (
    <div
      ref={containerRef}
      onPointerMove={showControls}
      onPointerDown={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      className={`group relative aspect-video w-full select-none overflow-hidden bg-background ${hideUi ? 'cursor-none' : ''} ${fullscreen ? 'h-full' : ''}`}
    >
      <video
        key={attempt}
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        playsInline
        preload="metadata"
        aria-label={`Episódio: ${title}`}
        className="size-full bg-background object-contain"
        onPlay={() => {
          setPlaying(true)
          setStarted(true)
          showControls()
        }}
        onPause={() => {
          setPlaying(false)
          setControlsVisible(true)
        }}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => setWaiting(false)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration)
          e.currentTarget.playbackRate = speed
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onProgress={(e) => {
          const b = e.currentTarget.buffered
          if (b.length) setBuffered(b.end(b.length - 1))
        }}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume)
          setMuted(e.currentTarget.muted)
        }}
        onError={() => {
          setFailed(true)
          setWaiting(false)
        }}
        onEnded={() => nextHref && router.push(nextHref)}
      />

      <button
        type="button"
        aria-label={playing ? 'Pausar' : 'Reproduzir'}
        onClick={handleSurfaceClick}
        onDoubleClick={handleSurfaceDoubleClick}
        className="absolute inset-0 z-0 outline-none"
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-1 bg-gradient-to-b from-background/90 to-transparent p-4 pb-16 transition-opacity duration-300 md:p-6 ${hideUi ? 'opacity-0' : 'opacity-100'}`}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-primary">{subtitle}</p>
        <p className="line-clamp-1 text-sm font-black md:text-lg">{title}</p>
      </div>

      {waiting && !failed && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="size-12 animate-spin text-primary" aria-label="Carregando" />
        </div>
      )}

      {!playing && !waiting && !failed && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition group-hover:scale-110 md:size-20">
            <Play className="ml-1 size-8 fill-current md:size-10" aria-hidden="true" />
          </span>
        </div>
      )}

      {flash && (
        <div
          key={flash.key}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          onAnimationEnd={() => setFlash(null)}
        >
          <span className="animate-player-flash rounded-full bg-background/70 px-5 py-3 text-lg font-black">
            {flash.label}
          </span>
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1 bg-gradient-to-t from-background/95 via-background/60 to-transparent px-3 pb-2 pt-12 transition-all duration-300 md:px-5 md:pb-3 ${hideUi ? 'pointer-events-none translate-y-2 opacity-0' : 'opacity-100'}`}
      >
        <div className="group/seek relative flex h-5 items-center">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-foreground/25 transition-all group-hover/seek:h-1.5">
            <div className="absolute inset-y-0 left-0 bg-foreground/40" style={{ width: `${bufferedPct}%` }} />
            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute size-3.5 -translate-x-1/2 rounded-full bg-primary opacity-0 shadow transition group-hover/seek:opacity-100"
            style={{ left: `${progress}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            aria-label="Posição do vídeo"
            aria-valuetext={`${formatTime(current)} de ${formatTime(duration)}`}
            onChange={(e) => {
              const v = videoRef.current
              if (v) v.currentTime = Number(e.target.value)
            }}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <ControlButton label={playing ? 'Pausar' : 'Reproduzir'} onClick={togglePlay}>
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
          </ControlButton>
          <ControlButton label="Voltar 10 segundos" onClick={() => seekBy(-10)}>
            <RotateCcw className="size-5" />
          </ControlButton>
          <ControlButton label="Avançar 10 segundos" onClick={() => seekBy(10)}>
            <RotateCw className="size-5" />
          </ControlButton>

          <div className="group/vol flex items-center">
            <ControlButton label={effectiveVolume === 0 ? 'Ativar som' : 'Silenciar'} onClick={toggleMute}>
              <VolumeIcon className="size-5" />
            </ControlButton>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={effectiveVolume}
              aria-label="Volume"
              onChange={(e) => {
                const v = videoRef.current
                if (!v) return
                v.volume = Number(e.target.value)
                v.muted = v.volume === 0
              }}
              className="hidden h-1 w-0 cursor-pointer accent-primary transition-all duration-200 group-hover/vol:w-20 focus-visible:w-20 md:block"
            />
          </div>

          <span className="ml-1 whitespace-nowrap text-xs font-bold tabular-nums text-foreground/90 md:text-sm">
            {`${formatTime(current)} / ${formatTime(duration)}`}
          </span>

          <div className="ml-auto flex items-center gap-1 md:gap-2">
            {nextHref && (
              <ControlButton label="Próximo episódio" onClick={() => router.push(nextHref)}>
                <SkipForward className="size-5 fill-current" />
              </ControlButton>
            )}

            <div className="relative">
              <ControlButton
                label="Velocidade de reprodução"
                onClick={() => setSpeedOpen((o) => !o)}
                expanded={speedOpen}
              >
                <Gauge className="size-5" />
              </ControlButton>
              {speedOpen && (
                <div
                  role="menu"
                  aria-label="Velocidade"
                  className="absolute bottom-full right-0 mb-2 flex w-36 flex-col bg-card py-1 shadow-2xl"
                >
                  <p className="px-3 py-2 text-xs font-black uppercase text-muted-foreground">Velocidade</p>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="menuitemradio"
                      aria-checked={speed === s}
                      onClick={() => {
                        setSpeed(s)
                        if (videoRef.current) videoRef.current.playbackRate = s
                        setSpeedOpen(false)
                      }}
                      className="flex items-center justify-between px-3 py-2 text-left text-sm font-bold transition hover:bg-secondary"
                    >
                      {s === 1 ? 'Normal' : `${s}x`}
                      {speed === s && <Check className="size-4 text-primary" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              href={downloadHref}
              download
              aria-label="Baixar episódio"
              title="Baixar episódio"
              className="flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-foreground/15 hover:text-primary md:size-10"
            >
              <Download className="size-5" aria-hidden="true" />
            </a>

            <ControlButton label="Picture-in-picture" onClick={togglePip} className="hidden md:flex">
              <PictureInPicture2 className="size-5" />
            </ControlButton>
            <ControlButton label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
            </ControlButton>
          </div>
        </div>
      </div>

      {failed && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-background/90 p-6 text-center">
          <p className="text-lg font-black">Não foi possível carregar o episódio</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            O servidor do vídeo pode estar lento ou fora do ar. Tente novamente em instantes.
          </p>
          <button
            type="button"
            onClick={retry}
            className="flex h-11 items-center gap-2 bg-primary px-5 text-sm font-black uppercase text-primary-foreground transition hover:brightness-110"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      )}

      {!started && !failed && <span className="sr-only">Carregando o episódio</span>}
    </div>
  )
}

function ControlButton({
  label,
  onClick,
  children,
  expanded,
  className = '',
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  expanded?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-expanded={expanded}
      onClick={onClick}
      className={`flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-foreground/15 hover:text-primary md:size-10 ${className}`}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  )
}
