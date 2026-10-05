import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import { slugify } from '@/lib/catalog'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { animeSlug, season, episodeNumber, episodeName, episodeUrl } = body

    if (!animeSlug || !season || !episodeNumber || !episodeName || !episodeUrl) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'data', 'links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(file)

    const animeTitle = Object.keys(data).find((title) => slugify(title) === animeSlug)

    if (!animeTitle) {
      return NextResponse.json({ error: 'Anime não encontrado' }, { status: 404 })
    }

    const anime = data[animeTitle]
    anime.temporadas ??= {}
    anime.temporadas[season] ??= []

    anime.temporadas[season].push({
      episodio: Number(episodeNumber),
      nome: episodeName,
      tipo: 'indefinido',
      temporada: String(season),
      url: episodeUrl,
      logo: anime.poster,
    })

    anime.temporadas[season].sort((a: any, b: any) => a.episodio - b.episodio)

    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao salvar episódio' }, { status: 500 })
  }
}
