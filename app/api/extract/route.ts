import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const UA = 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36'

async function get(url: string, referer?: string, json = false) {
  const headers: Record<string, string> = {
    'User-Agent': UA,
    'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
    Accept: json ? 'application/json,*/*' : 'text/html,application/xhtml+xml,*/*;q=0.8',
  }
  if (referer) headers.Referer = referer
  const response = await fetch(url, { headers, redirect: 'follow', cache: 'no-store' })
  if (!response.ok) throw new Error(`HTTP ${response.status} em ${url.slice(0, 80)}`)
  return response.text()
}

const RE_CALL = /}\s*_\w+\(\s*(\[[\s\S]*?\])\s*,\s*(\[[\d,\s]*\])\s*,\s*"([^"]+)"\s*\)\s*;?\s*}\)\(\)/

function decodeObfuscated(source: string) {
  const match = RE_CALL.exec(source)
  if (!match) return null
  try {
    const chunks = JSON.parse(match[1]) as string[]
    const indexes = JSON.parse(match[2]) as number[]
    const key = Buffer.from(match[3], 'base64')
    let encoded = indexes.map((index) => chunks[index]).join('')
    encoded += '='.repeat((4 - (encoded.length % 4)) % 4)
    const raw = Buffer.from(encoded, 'base64')
    const decoded = Buffer.alloc(raw.length)
    for (let i = 0; i < raw.length; i++) decoded[i] = raw[i] ^ key[i % key.length]
    return decoded.toString('utf8')
  } catch {
    return null
  }
}

function readObject(text: string, start: number) {
  let depth = 0
  let inString = false
  let escaped = false
  for (let index = start; index < text.length; index++) {
    const char = text[index]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
    } else if (char === '"') inString = true
    else if (char === '{') depth++
    else if (char === '}' && --depth === 0) return JSON.parse(text.slice(start, index + 1)) as Record<string, any>
  }
  return null
}

function findConfig(html: string) {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1])
  const pool = [html, ...scripts]
  for (const block of [...pool]) {
    const decoded = decodeObfuscated(block)
    if (decoded) pool.push(decoded)
  }
  for (const block of pool) {
    const marker = /AniDrivePlayerConfig\s*=\s*/.exec(block)
    if (!marker) continue
    const start = marker.index + marker[0].length
    if (block[start] !== '{') continue
    try {
      const config = readObject(block, start)
      if (config) return config
    } catch {}
  }
  return null
}

function mp4Sources(data: any) {
  return ((data?.sources || []) as Array<{ label?: string; file?: string }>)
    .filter((source) => source.file)
    .map((source) => ({ label: String(source.label || '').trim(), file: source.file as string }))
    .sort((a, b) => (parseInt(b.label.match(/(\d{3,4})/)?.[1] || '0') - parseInt(a.label.match(/(\d{3,4})/)?.[1] || '0')))
}

async function extract(source: string) {
  let url = source
  let referer = 'https://animesonline.io/'
  if (!new URL(source).hostname.includes('anidrive')) {
    const page = await get(source)
    const iframe = /<iframe\b[^>]*?(?:data-src|src)\s*=\s*(["'])([\s\S]*?)\1[^>]*>/i.exec(page)
    const iframeUrl = iframe?.[2]?.replace(/&amp;/g, '&')
    if (!iframeUrl || !/\banidrive\.click\b/i.test(iframeUrl)) throw new Error('iframe do anidrive não encontrado na página')
    referer = source
    url = new URL(iframeUrl, source).toString()
  }
  const config = findConfig(await get(url, referer))
  if (!config) throw new Error('AniDrivePlayerConfig não encontrado (formato mudou?)')
  const result: { title: string; referer: string; hls: string[]; mp4: Array<{ label: string; file: string }> } = {
    title: config.title || 'video',
    referer: url,
    hls: (config.sources || []).filter((item: any) => item.file).map((item: any) => item.file),
    mp4: [],
  }
  if (config.downloadDataUrl) {
    try { result.mp4 = mp4Sources(JSON.parse(await get(config.downloadDataUrl, url, true))) } catch {}
  }
  return result
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('u')
  if (!url) return NextResponse.json({ error: 'falta ?u=LINK' }, { status: 400 })
  try {
    new URL(url)
    return NextResponse.json(await extract(url), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
