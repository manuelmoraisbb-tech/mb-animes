'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ExternalLink, RotateCcw } from 'lucide-react'

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
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-card ring-1 ring-border">
      {failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertTriangle className="size-8 text-primary" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-heading text-lg font-semibold">Não foi possível carregar o vídeo</p>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              O servidor do vídeo pode estar fora do ar ou bloqueando a reprodução neste navegador.
              Tente novamente ou abra o link direto.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFailed(false)
                setAttempt((n) => n + 1)
              }}
              className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Tentar novamente
            </button>
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-semibold hover:bg-background"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Abrir link direto
            </a>
          </div>
        </div>
      ) : (
        <video
          key={attempt}
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          preload="metadata"
          aria-label={title}
          onError={() => setFailed(true)}
          onEnded={() => nextHref && router.push(nextHref)}
          className="h-full w-full bg-background object-contain"
        />
      )}
    </div>
  )
}
