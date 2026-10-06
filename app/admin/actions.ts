'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, slugify } from '@/lib/admin'
import links from '@/data/links.json'

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim()
const number = (form: FormData, key: string) => Number(text(form, key))
const validUrl = (value: string) => /^https?:\/\//i.test(value)

function finish(slug: string | null, message: string, ok = true): never {
  revalidatePath('/', 'layout')
  redirect(`${slug ? `/admin/${slug}` : '/admin'}?msg=${encodeURIComponent(message)}&ok=${ok ? 1 : 0}`)
}

export async function importBundledCatalog() {
  const supabase = await requireAdmin()
  const catalog = links as Record<string, { poster?: string; temporadas?: Record<string, Array<{ episodio?: number; nome?: string; tipo?: string; url?: string }>> }>
  let animeCount = 0
  let episodeCount = 0
  for (const [title, value] of Object.entries(catalog)) {
    const slug = slugify(title)
    if (!slug) continue
    const { data: anime, error: animeError } = await supabase.from('animes').upsert({ title, slug, poster: value.poster ?? '' }, { onConflict: 'slug' }).select('id').single()
    if (animeError || !anime) finish(null, animeError?.message ?? 'Não foi possível importar o anime.', false)
    const rows = Object.entries(value.temporadas ?? {}).flatMap(([seasonKey, episodes]) => episodes.flatMap((episode) => {
      const season = Number(seasonKey); const number = Number(episode.episodio); const url = String(episode.url ?? '').trim()
      if (!Number.isInteger(season) || season < 1 || !Number.isInteger(number) || number < 1 || !/^https?:\/\//i.test(url)) return []
      return [{ anime_id: anime.id, season, number, name: episode.nome ?? `${title} S${String(season).padStart(2, '0')}E${String(number).padStart(2, '0')}`, url, tipo: episode.tipo ?? 'indefinido' }]
    }))
    if (rows.length) { const { error } = await supabase.from('episodes').upsert(rows, { onConflict: 'anime_id,season,number' }); if (error) finish(null, error.message, false); episodeCount += rows.length }
    animeCount++
  }
  revalidatePath('/', 'layout')
  redirect(`/admin?msg=${encodeURIComponent(`${animeCount} animes e ${episodeCount} episódios importados do links.json.`)}&ok=1`)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function createAnime(form: FormData) {
  const supabase = await requireAdmin()
  const title = text(form, 'title')
  const slug = slugify(title)
  if (!title || !slug) finish(null, 'Indica um título válido.', false)
  const { error } = await supabase.from('animes').insert({ title, slug, poster: text(form, 'poster') })
  if (error) finish(null, error.code === '23505' ? 'Este anime já existe.' : error.message, false)
  finish(slug, 'Anime criado. Adiciona uma temporada e episódios.')
}

export async function updateAnime(form: FormData) {
  const supabase = await requireAdmin(); const slug = text(form, 'slug'); const title = text(form, 'title')
  const { error } = await supabase.from('animes').update({ title, poster: text(form, 'poster') }).eq('id', number(form, 'id'))
  if (error) finish(slug, error.message, false); finish(slug, 'Anime atualizado.')
}

export async function deleteAnime(form: FormData) {
  const slug = text(form, 'slug'); if (!form.get('confirm')) finish(slug, 'Confirma a remoção.', false)
  const supabase = await requireAdmin(); const { error } = await supabase.from('animes').delete().eq('id', number(form, 'id'))
  if (error) finish(slug, error.message, false); finish(null, 'Anime removido.')
}

export async function addEpisodes(form: FormData) {
  const supabase = await requireAdmin(); const slug = text(form, 'slug'); const animeId = number(form, 'id'); const season = number(form, 'season')
  const { data: anime } = await supabase.from('animes').select('title').eq('id', animeId).maybeSingle()
  if (!anime || !Number.isInteger(season) || season < 1) finish(slug, 'Dados inválidos.', false)
  const { data: existing } = await supabase.from('episodes').select('number,url').eq('anime_id', animeId).eq('season', season)
  const nums = new Set((existing ?? []).map((episode) => episode.number)); const urls = new Set((existing ?? []).map((episode) => episode.url)); let next = Math.max(0, ...nums) + 1
  const rows: Record<string, unknown>[] = []; let skipped = 0
  for (const raw of String(form.get('lines') ?? '').split(/\r?\n/)) { const line = raw.trim(); if (!line) continue; const parts = line.split('|').map((part) => part.trim()); const url = parts.at(-1) ?? ''; if (!validUrl(url)) { skipped++; continue }; let n = next; let name = ''; const explicit = Number(parts[0]); if (Number.isInteger(explicit) && explicit > 0) n = explicit; else if (parts.length === 2) name = parts[0]; if (parts.length >= 3) name = parts[1]; if (nums.has(n) || urls.has(url)) { skipped++; continue }; rows.push({ anime_id: animeId, season, number: n, name: name || `${anime.title} S${String(season).padStart(2, '0')}E${String(n).padStart(2, '0')}`, url }); nums.add(n); urls.add(url); next = Math.max(next, n + 1) }
  if (rows.length) { const { error } = await supabase.from('episodes').insert(rows); if (error) finish(slug, error.message, false) }
  finish(slug, `${rows.length} episódio(s) adicionado(s)${skipped ? `, ${skipped} ignorado(s)` : ''}.`, rows.length > 0)
}

export async function updateEpisode(form: FormData) {
  const supabase = await requireAdmin(); const slug = text(form, 'slug'); const { error } = await supabase.from('episodes').update({ number: number(form, 'number'), name: text(form, 'name'), url: text(form, 'url') }).eq('id', number(form, 'episodeId'))
  if (error) finish(slug, error.message, false); finish(slug, 'Episódio guardado.')
}

export async function deleteEpisode(form: FormData) {
  const supabase = await requireAdmin(); const slug = text(form, 'slug'); const { error } = await supabase.from('episodes').delete().eq('id', number(form, 'episodeId'))
  if (error) finish(slug, error.message, false); finish(slug, 'Episódio removido.')
}

export async function deleteSeason(form: FormData) {
  const supabase = await requireAdmin(); const slug = text(form, 'slug'); if (!form.get('confirm')) finish(slug, 'Confirma a remoção.', false); const { error } = await supabase.from('episodes').delete().eq('anime_id', number(form, 'id')).eq('season', number(form, 'season')); if (error) finish(slug, error.message, false); finish(slug, 'Temporada removida.')
}
