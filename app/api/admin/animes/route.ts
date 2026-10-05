import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, poster } = body

    if (!title || !poster) {
      return NextResponse.json({ error: 'Título e pôster são obrigatórios' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'data', 'links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(file)

    data[title] = {
      poster,
      temporadas: {},
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao salvar anime' }, { status: 500 })
  }
}
