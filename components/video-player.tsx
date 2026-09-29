'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'

export function VideoPlayer({
  src,
  poster,
  title,
  nextHref,
}: {
  src: string
  poster: string
  title: string
  nextHref: string | null
}) {
  const router = useRouter()
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-background">
      <video
        key={attempt}
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        preload="metadata"
        aria-label={`Episódio: ${title}`}
        className="size-full bg-background object-contain"
        onError={() => setFailed(true)}
        onEnded={() => nextHref && router.push(nextHref)}
      />
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 p-6 text-center">
          <p className="text-lg font-black">Não foi possível carregar o episódio</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            O servidor do vídeo pode estar lento ou fora do ar. Tente novamente em instantes.
          </p>
          <button
            type="button"
            onClick={() => {
              setFailed(false)
              setAttempt((n) => n + 1)
            }}
            className="flex h-11 items-center gap-2 bg-primary px-5 text-sm font-black uppercase text-primary-foreground transition hover:brightness-110"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
