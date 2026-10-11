import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 Chrome/124.0 Mobile Safari/537.36'

function decodeObfuscated(script: string) {
  const match = script.match(/}\s*_[A-Za-z0-9_$]+\(\s*(\[[\s\S]*?\])\s*,\s*(\[[\d,\s]*\])\s*,\s*"([^"]+)"\s*\)\s*;?\s*}\)\(\)/)
  if (!match) return null
  try {
    const chunks = JSON.parse(match[1]) as string[]
    const indexes = JSON.parse(match[2]) as number[]
    const key = Buffer.from(match[3], 'base64')
    let encoded = indexes.map((index) => chunks[index]).join('')
    encoded += '='.repeat((4 - (encoded.length % 4)) % 4)
    const raw = Buffer.from(encoded, 'base64')
    return Buffer.from(raw.map((value, index) => value ^ key[index % key.length])).toString('utf8')
  } catch {
    return null
  }
}

function findConfig(html: string) {
  const blocks = [html, ...(html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) ?? []).map((block) => block.replace(/^<script\b[^>]*>|<\/script>$/gi, ''))]
  const pool = [...blocks, ...blocks.map(decodeObfuscated).filter(Boolean) as string[]]
  for (const text of pool) {
    const marker = text.match(/AniDrivePlayerConfig\s*=\s*/)
    if (!marker || marker.index === undefined) continue
    try {
      return JSON.parse(text.slice(marker.index + marker[0].length)) as {
        downloadDataUrl?: string
        sources?: Array<{ file?: string; label?: string }>
      }
    } catch {
      continue
    }
  }
  return null
}

async function resolve(source: string) {
  const page = new URL(source)
  if (!/(^|\.)anidrive\.click$/i.test(page.hostname)) return null
  const response = await fetch(page, { cache: 'no-store', headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*', Referer: 'https://anidrive.click/' } })
  if (!response.ok) return null
  const config = findConfig(await response.text())
  if (!config) return null

  if (config.downloadDataUrl) {
    const downloadUrl = new URL(config.downloadDataUrl, page).toString()
    const downloadResponse = await fetch(downloadUrl, { cache: 'no-store', headers: { 'User-Agent': USER_AGENT, Accept: 'application/json,*/*', Referer: page.toString() } })
    if (downloadResponse.ok) {
      const data = await downloadResponse.json() as { sources?: Array<{ file?: string; label?: string }> }
      const sources = (data.sources ?? []).filter((item) => item.file?.includes('googlevideo.com/videoplayback'))
      sources.sort((a, b) => Number((b.label ?? '').match(/\d{3,4}/)?.[0] ?? 0) - Number((a.label ?? '').match(/\d{3,4}/)?.[0] ?? 0))
      if (sources[0]?.file) return sources[0].file
    }
  }
  return config.sources?.find((item) => item.file?.includes('googlevideo.com/videoplayback'))?.file ?? null
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('url')
  const name = (request.nextUrl.searchParams.get('name') ?? 'episodio').replace(/[^\w-]+/g, '_')
  const download = request.nextUrl.searchParams.get('download') === '1'
  if (!source) return new Response('falta o URL do AniDrive', { status: 400 })

  const link = await resolve(source).catch(() => null)
  if (!link) return new Response('não foi possível obter o link final do AniDrive', { status: 502 })
  const range = request.headers.get('range')
  const upstream = await fetch(link, { cache: 'no-store', headers: { 'User-Agent': USER_AGENT, Referer: 'https://anidrive.click/', ...(range ? { Range: range } : {}) }, signal: AbortSignal.any([request.signal, AbortSignal.timeout(290_000)]) }).catch(() => null)
  if (!upstream || (!upstream.ok && upstream.status !== 206)) return new Response('erro na origem', { status: 502 })

  const headers = new Headers({ 'Content-Type': upstream.headers.get('content-type') ?? 'video/mp4', 'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${name}.mp4"`, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' })
  for (const key of ['content-length', 'content-range']) { const value = upstream.headers.get(key); if (value) headers.set(key, value) }
  return new Response(upstream.body, { status: upstream.status, headers })
}
