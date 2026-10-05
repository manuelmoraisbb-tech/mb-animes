import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { slugify } from '@/lib/catalog'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { animeSlug, season, episodeNumber, episodeName, episodeUrl } = body

    if (!animeSlug || !season || !episodeNumber || !episodeName || !episodeUrl) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Read current links.json
    const linksPath = path.join(process.cwd(), 'data', 'links.json')
    const content = await fs.readFile(linksPath, 'utf-8')
    const links = JSON.parse(content)

    // Find anime by title (we need to reverse slugify)
    // This is a limitation - ideally we'd store the title with the data
    let animeTitle = Object.keys(links).find((title) => slugify(title) === animeSlug)

    if (!animeTitle) {
      return NextResponse.json(
        { error: 'Anime não encontrado' },
        { status: 404 }
      )
    }

    const anime = links[animeTitle]
    if (!anime.temporadas) {
      anime.temporadas = {}
    }

    if (!anime.temporadas[season]) {
      anime.temporadas[season] = []
    }

    // Add episode
    anime.temporadas[season].push({
      episodio: Number(episodeNumber),
      nome: episodeName,
      tipo: 'indefinido',
      temporada: String(season),
      url: episodeUrl,
      logo: anime.poster,
    })

    // Sort episodes by number
    anime.temporadas[season].sort((a: any, b: any) => a.episodio - b.episodio)

    // Write back
    await fs.writeFile(linksPath, JSON.stringify(links, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Episódio adicionado com sucesso',
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}
