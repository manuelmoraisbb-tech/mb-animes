import { HomeHero, type HeroSlide } from '@/components/home-hero'
import { AnimeRow } from '@/components/anime-row'
import {
  getDailyPicks,
  getLongestSeries,
  getMultiSeason,
  getShortSeries,
  toSummary,
} from '@/lib/catalog'

export default function HomePage() {
  const picks = getDailyPicks(20)
  const slides: HeroSlide[] = picks.slice(0, 5).map((anime) => {
    const first = anime.seasons[0]
    return {
      ...toSummary(anime),
      firstEpisodeHref: first ? `/assistir/${anime.slug}/${first.number}/${first.episodes[0].number}` : null,
    }
  })

  return (
    <div className="flex flex-col gap-12 pb-4">
      <HomeHero slides={slides} />
      <AnimeRow
        title="Escolhas de hoje"
        subtitle="Uma seleção nova a cada dia."
        animes={picks.slice(5).map(toSummary)}
      />
      <AnimeRow
        title="Para maratonar"
        subtitle="As séries com mais episódios do catálogo."
        animes={getLongestSeries(20).map(toSummary)}
      />
      <AnimeRow
        title="Várias temporadas"
        animes={getMultiSeason(20).map(toSummary)}
      />
      <AnimeRow
        title="Curtinhos"
        subtitle="Até 13 episódios, dá pra ver em um fim de semana."
        animes={getShortSeries(20).map(toSummary)}
      />
    </div>
  )
}
