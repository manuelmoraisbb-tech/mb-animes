import { HomeHero } from '@/components/home-hero'
import { AnimeRow } from '@/components/anime-row'
import {
  getCatalogStats,
  getDailyPicks,
  getLongestSeries,
  getMultiSeason,
  getPosterWall,
  getShortSeries,
  toSummary,
} from '@/lib/catalog'

export const revalidate = 3600

export default function HomePage() {
  const picks = getDailyPicks(19)
  const [featured, ...rest] = picks

  return (
    <div className="flex flex-col gap-12">
      <HomeHero featured={featured} wall={getPosterWall()} stats={getCatalogStats()} />
      <AnimeRow
        title="Escolhas de hoje"
        description="Uma seleção nova a cada dia."
        animes={rest.map(toSummary)}
        href="/catalogo"
      />
      <AnimeRow
        title="Para maratonar"
        description="As séries com mais episódios do catálogo."
        animes={getLongestSeries(18).map(toSummary)}
      />
      <AnimeRow
        title="Várias temporadas"
        description="Histórias que continuam."
        animes={getMultiSeason(18).map(toSummary)}
      />
      <AnimeRow
        title="Rapidinhos"
        description="Até 13 episódios — dá pra terminar no fim de semana."
        animes={getShortSeries(18).map(toSummary)}
      />
    </div>
  )
}
