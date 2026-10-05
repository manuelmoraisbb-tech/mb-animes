import rawLinks from '@/data/links.json'
import rawImages from '@/data/imagens.json'

type RawEpisode = {
  episodio: number
  nome: string
  url: string
  logo?: string
}

type RawAnime = {
  poster: string
  temporadas: Record<string, RawEpisode[]>
}

export type Episode = {
  number: number
  name: string
  url: string
}

export type Season = {
  number: number
  episodes: Episode[]
}

export type Anime = {
  slug: string
  title: string
  poster: string
  seasons: Season[]
  totalEpisodes: number
}

export type AnimeSummary = {
  slug: string
  title: string
  poster: string
  seasonCount: number
  totalEpisodes: number
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const MIRROR_BASE = 'http://89.222.120.130:34871/s3v3/0-uncategorized'

/**
 * auth.urlsync.gy only redirects to the real file server, keeping the file name
 * (e.g. .../abc123abc/144277.mp4 -> MIRROR_BASE/144277.mp4), so we skip the redirect.
 */
export function toMirrorUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.host !== 'auth.urlsync.gy') return url
    const file = parsed.pathname.split('/').pop()
    return file ? `${MIRROR_BASE}/${file}` : url
  } catch {
    return url
  }
}

function buildCatalog() {
  const entries = Object.entries(rawLinks as Record<string, RawAnime>)
  const list: Anime[] = []
  const bySlug = new Map<string, Anime>()

  for (const [title, raw] of entries) {
    let slug = slugify(title) || 'anime'
    let suffix = 2
    while (bySlug.has(slug)) slug = `${slugify(title)}-${suffix++}`

    const seasons: Season[] = Object.entries(raw.temporadas ?? {})
      .map(([seasonKey, eps]) => ({
        number: Number(seasonKey) || 1,
        episodes: [...eps]
          .sort((a, b) => a.episodio - b.episodio)
          .map((ep) => ({ number: ep.episodio, name: ep.nome, url: toMirrorUrl(ep.url) })),
      }))
      .filter((s) => s.episodes.length > 0)
      .sort((a, b) => a.number - b.number)

    const anime: Anime = {
      slug,
      title,
      poster: raw.poster,
      seasons,
      totalEpisodes: seasons.reduce((n, s) => n + s.episodes.length, 0),
    }
    list.push(anime)
    bySlug.set(slug, anime)
  }

  list.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  return { list, bySlug }
}

const catalog = buildCatalog()

export function toSummary(anime: Anime): AnimeSummary {
  return {
    slug: anime.slug,
    title: anime.title,
    poster: anime.poster,
    seasonCount: anime.seasons.length,
    totalEpisodes: anime.totalEpisodes,
  }
}

export function getAllAnimes() {
  return catalog.list
}

export function getAllSummaries() {
  return catalog.list.map(toSummary)
}

export function getAnimeBySlug(slug: string) {
  return catalog.bySlug.get(slug)
}

export function getCatalogStats() {
  return {
    animes: catalog.list.length,
    episodes: catalog.list.reduce((n, a) => n + a.totalEpisodes, 0),
  }
}

let allowedHosts: Set<string> | null = null
export function getAllowedVideoHosts() {
  if (!allowedHosts) {
    allowedHosts = new Set()
    for (const anime of catalog.list)
      for (const season of anime.seasons)
        for (const ep of season.episodes) {
          try {
            allowedHosts.add(new URL(ep.url).host)
          } catch {}
        }
  }
  return allowedHosts
}

/** HTTP video links are routed through our HTTPS proxy to avoid mixed-content blocking. */
export function getPlayableUrl(url: string) {
  return url.startsWith('http://') ? `/api/stream?url=${encodeURIComponent(url)}` : url
}

/** Always proxied so the browser gets a same-origin file with a proper download filename. */
export function getDownloadUrl(url: string, fileName: string) {
  const ext = url.split('?')[0].match(/\.(mp4|mkv|avi|m4v|webm|ts)$/i)?.[0] ?? '.mp4'
  return `/api/stream?url=${encodeURIComponent(url)}&download=${encodeURIComponent(fileName + ext)}`
}

export function getPosterWall() {
  const images = (rawImages as { imagens: string[] }).imagens ?? []
  return images.length > 0 ? images : catalog.list.map((a) => a.poster)
}

/** Deterministic daily shuffle so "picks" rotate without a database. */
export function getDailyPicks(count: number) {
  const seed = Math.floor(Date.now() / 86_400_000)
  const scored = catalog.list.map((anime, i) => ({
    anime,
    score: Math.sin(seed * 9301 + i * 49297) * 10000 - Math.floor(Math.sin(seed * 9301 + i * 49297) * 10000),
  }))
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map((s) => s.anime)
}

export function getLongestSeries(count: number) {
  return [...catalog.list]
    .sort((a, b) => b.totalEpisodes - a.totalEpisodes)
    .slice(0, count)
}

export function getMultiSeason(count: number) {
  return [...catalog.list]
    .filter((a) => a.seasons.length > 1)
    .sort((a, b) => b.seasons.length - a.seasons.length)
    .slice(0, count)
}

export function getShortSeries(count: number) {
  return catalog.list
    .filter((a) => a.totalEpisodes > 0 && a.totalEpisodes <= 13)
    .slice(0, count)
}

export function getRelated(anime: Anime, count: number) {
  const words = new Set(
    slugify(anime.title)
      .split('-')
      .filter((w) => w.length > 3),
  )
  const related = catalog.list.filter(
    (a) =>
      a.slug !== anime.slug &&
      slugify(a.title)
        .split('-')
        .some((w) => words.has(w)),
  )
  const fillers = getDailyPicks(count * 2).filter(
    (a) => a.slug !== anime.slug && !related.includes(a),
  )
  return [...related, ...fillers].slice(0, count)
}

/** Reads the live Supabase catalog and falls back to the bundled JSON during setup. */
export async function getLiveCatalog() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const [{ data: rows, error: animeError }, { data: episodes, error: episodeError }] = await Promise.all([
      supabase.from('catalog_animes').select('slug,title,poster,hidden,featured').eq('hidden', false).order('title'),
      supabase.from('catalog_episodes').select('anime_slug,season,episode,name,url').eq('removed', false).order('season').order('episode'),
    ])
    if (animeError || episodeError || !rows?.length) return catalog.list
    const episodeMap = new Map<string, Season[]>()
    for (const ep of episodes ?? []) {
      const seasons = episodeMap.get(ep.anime_slug) ?? []
      let season = seasons.find((item) => item.number === ep.season)
      if (!season) { season = { number: ep.season, episodes: [] }; seasons.push(season); episodeMap.set(ep.anime_slug, seasons) }
      season.episodes.push({ number: ep.episode, name: ep.name, url: toMirrorUrl(ep.url) })
    }
    return rows.map((row) => {
      const seasons = (episodeMap.get(row.slug) ?? []).sort((a, b) => a.number - b.number)
      return { slug: row.slug, title: row.title, poster: row.poster ?? '', seasons, totalEpisodes: seasons.reduce((total, season) => total + season.episodes.length, 0) }
    }).filter((anime) => anime.seasons.length > 0)
  } catch {
    return catalog.list
  }
}

export async function getLiveAnimeBySlug(slug: string) {
  return (await getLiveCatalog()).find((anime) => anime.slug === slug)
}
