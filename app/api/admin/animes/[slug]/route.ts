import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import { slugify } from '@/lib/catalog'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const filePath = path.join(process.cwd(), 'data', 'links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(file)

    const title = Object.keys(data).find((item) => slugify(item) === slug)
    if (!title) {
      return NextResponse.json({ error: 'Anime não encontrado' }, { status: 404 })
    }

    delete data[title]
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao excluir anime' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { title, poster } = body

    if (!title || !poster) {
      return NextResponse.json({ error: 'Título e pôster são obrigatórios' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'data', 'links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(file)

    const originalTitle = Object.keys(data).find((item) => slugify(item) === slug)
    if (!originalTitle) {
      return NextResponse.json({ error: 'Anime não encontrado' }, { status: 404 })
    }

    const item = data[originalTitle]
    delete data[originalTitle]
    data[title] = {
      ...item,
      poster,
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar anime' }, { status: 500 })
  }
}
