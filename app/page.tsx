import { HomeHero, type HeroSlide } from '@/components/home-hero'
import { AnimeRow } from '@/components/anime-row'
import {
  getLiveCatalog,
  toSummary,
} from '@/lib/catalog'

export default async function HomePage() {
  const liveCatalog = await getLiveCatalog()
  const picks = [...liveCatalog].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')).slice(0, 20)
  const longest = [...liveCatalog].sort((a, b) => b.totalEpisodes - a.totalEpisodes).slice(0, 20)
  const multiSeason = liveCatalog.filter((anime) => anime.seasons.length > 1).slice(0, 20)
  const short = liveCatalog.filter((anime) => anime.totalEpisodes > 0 && anime.totalEpisodes <= 13).slice(0, 20)
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
        animes={longest.map(toSummary)}
      />
      <AnimeRow
        title="Várias temporadas"
        animes={multiSeason.map(toSummary)}
      />
      <AnimeRow
        title="Curtinhos"
        subtitle="Até 13 episódios, dá pra ver em um fim de semana."
        animes={short.map(toSummary)}
      />
    </div>
  )
}
