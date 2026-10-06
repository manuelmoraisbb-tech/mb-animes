import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@/lib/supabase/server'

const filePath = path.join(process.cwd(), 'data', 'links.json')

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Sessão necessária.' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return { error: NextResponse.json({ error: 'Acesso de administrador necessário.' }, { status: 403 }) }
  return { supabase }
}

export async function GET() {
  const result = await requireAdmin()
  if ('error' in result) return result.error
  try {
    const content = await readFile(filePath, 'utf8')
    return NextResponse.json({ content })
  } catch {
    return NextResponse.json({ error: 'O arquivo data/links.json não foi encontrado.' }, { status: 404 })
  }
}

export async function PUT(request: Request) {
  const result = await requireAdmin()
  if ('error' in result) return result.error
  const body = await request.json().catch(() => null)
  if (!body || typeof body.content !== 'string') return NextResponse.json({ error: 'Conteúdo inválido.' }, { status: 400 })
  if (body.content.length > 25_000_000) return NextResponse.json({ error: 'O arquivo excede o limite de 25 MB.' }, { status: 413 })
  try {
    const parsed = JSON.parse(body.content)
    if (!parsed || typeof parsed !== 'object') throw new Error('JSON deve começar por um objeto ou array.')
    await writeFile(filePath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
    return NextResponse.json({ ok: true, content: `${JSON.stringify(parsed, null, 2)}\n` })
  } catch (error) {
    return NextResponse.json({ error: error instanceof SyntaxError ? 'JSON inválido. Corrige a estrutura antes de guardar.' : 'Não foi possível guardar o arquivo.' }, { status: 400 })
  }
}
