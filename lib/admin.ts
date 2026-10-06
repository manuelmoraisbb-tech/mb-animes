import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 200)

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) redirect('/admin?msg=Acesso restrito&ok=0')
  return supabase
}

export async function listAnimes() {
  const supabase = await requireAdmin()
  const { data, error } = await supabase.from('animes').select('id,title,slug,poster,episodes(season)').order('title')
  if (error) throw error
  return (data ?? []).map((anime) => {
    const seasons = new Set((anime.episodes ?? []).map((episode: { season: number }) => episode.season)).size
    return { ...anime, episodes: anime.episodes?.length ?? 0, seasons }
  })
}

export async function getAnimeWithEpisodes(slug: string) {
  const supabase = await requireAdmin()
  const { data: anime, error } = await supabase.from('animes').select('id,title,slug,poster').eq('slug', slug).maybeSingle()
  if (error || !anime) return null
  const { data: episodes, error: episodeError } = await supabase.from('episodes').select('id,season,number,name,url').eq('anime_id', anime.id).order('season').order('number')
  if (episodeError) throw episodeError
  return { anime, episodes: episodes ?? [] }
}

export type EpisodeRow = { id: number; season: number; number: number; name: string; url: string }
