'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

export type HeroSlide = {
  slug: string
  title: string
  poster: string
  seasonCount: number
  totalEpisodes: number
  firstEpisodeHref: string | null
}

const DURATION_MS = 8000

export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  if (slides.length === 0) return null
  const slide = slides[index]
  const go = (next: number) => setIndex((next + slides.length) % slides.length)

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.slug}
          aria-hidden={i !== index}
          className={`absolute inset-0 -z-10 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
        >
          {s.poster && (
            <>
              <Image
                src={s.poster}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="scale-110 object-cover opacity-40 blur-2xl"
              />
              <div className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
                <Image
                  src={s.poster}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="50vw"
                  className="object-cover object-top [mask-image:linear-gradient(to_right,transparent,black_40%)]"
                />
              </div>
              <Image
                src={s.poster}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-top md:hidden"
              />
            </>
          )}
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/60 to-transparent md:bg-gradient-to-r md:from-background md:via-background/80" />

      <div className="mx-auto flex min-h-[32rem] max-w-screen-2xl flex-col justify-end gap-8 px-4 pb-8 pt-40 md:min-h-[36rem] md:justify-center md:px-8 md:pt-16">
        <div key={slide.slug} className="hero-in flex max-w-lg flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Em destaque hoje</p>
          <h1 className="text-3xl font-black leading-tight text-balance md:text-5xl">{slide.title}</h1>
          <p className="text-sm text-muted-foreground">
            {`Dublado/Legendado · ${slide.seasonCount} temporada${slide.seasonCount === 1 ? '' : 's'} · ${slide.totalEpisodes} episódios`}
          </p>
          <div className="flex flex-wrap gap-3">
            {slide.firstEpisodeHref && (
              <Link
                href={slide.firstEpisodeHref}
                className="flex h-11 items-center gap-2 bg-primary px-5 text-sm font-black uppercase text-primary-foreground transition hover:brightness-110"
              >
                <Play className="size-5 fill-current" aria-hidden="true" />
                Começar a assistir T1 E1
              </Link>
            )}
            <Link
              href={`/anime/${slide.slug}`}
              className="flex h-11 items-center border-2 border-primary px-5 text-sm font-black uppercase text-primary transition hover:bg-primary/10"
            >
              Mais detalhes
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Destaque anterior"
            className="hidden size-9 items-center justify-center text-muted-foreground transition hover:text-foreground md:flex"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <div className="flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ir para ${s.title}`}
                aria-current={i === index}
                className={`relative h-2 overflow-hidden rounded-full bg-foreground/30 transition-all ${i === index ? 'w-10' : 'w-2 hover:bg-foreground/60'}`}
              >
                {i === index && (
                  <span
                    key={`${s.slug}-${index}`}
                    className="hero-progress absolute inset-0 rounded-full bg-primary"
                    data-paused={paused}
                    style={{ '--hero-duration': `${DURATION_MS}ms` } as React.CSSProperties}
                    onAnimationEnd={() => go(index + 1)}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Próximo destaque"
            className="hidden size-9 items-center justify-center text-muted-foreground transition hover:text-foreground md:flex"
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
