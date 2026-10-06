import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import { slugify } from '@/lib/catalog'

export async function DELETE(request: NextRequest) {
  try {
    const { animeSlug, season, episodeNumber } = await request.json()

    if (!animeSlug || !season || !episodeNumber) {
      return NextResponse.json({ error: 'Dados do episódio são obrigatórios' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'data', 'links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(file)

    const animeTitle = Object.keys(data).find((title) => slugify(title) === animeSlug)
    if (!animeTitle) {
      return NextResponse.json({ error: 'Anime não encontrado' }, { status: 404 })
    }

    const anime = data[animeTitle]
    const seasonKey = String(season)
    anime.temporadas ??= {}
    anime.temporadas[seasonKey] = (anime.temporadas[seasonKey] || []).filter(
      (ep: any) => ep.episodio !== Number(episodeNumber),
    )

    if (anime.temporadas[seasonKey].length === 0) {
      delete anime.temporadas[seasonKey]
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao excluir episódio' }, { status: 500 })
  }
}
