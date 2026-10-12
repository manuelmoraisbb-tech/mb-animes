import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const UA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/124.0 Mobile Safari/537.36'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('u')
  const referer = request.nextUrl.searchParams.get('r')
  if (!url) return new NextResponse('Falta ?u=LINK', { status: 400 })

  let target: URL
  try {
    target = new URL(url)
  } catch {
    return new NextResponse('URL inválido', { status: 400 })
  }
  if (!/^https?:$/.test(target.protocol)) return new NextResponse('Protocolo inválido', { status: 400 })

  const headers = new Headers({ 'User-Agent': UA })
  if (referer) {
    headers.set('Referer', referer)
    try { headers.set('Origin', new URL(referer).origin) } catch {}
  }
  const range = request.headers.get('range')
  if (range) headers.set('Range', range)

  let upstream: Response
  try {
    upstream = await fetch(target, { headers, redirect: 'follow', cache: 'no-store' })
  } catch (error) {
    return new NextResponse(`Falha ao contactar o servidor: ${error instanceof Error ? error.message : String(error)}`, { status: 502 })
  }

  const contentType = upstream.headers.get('content-type') || ''
  const isM3u8 = /mpegurl/i.test(contentType) || /\.m3u8?$/i.test(target.pathname)
  if (isM3u8) {
    const text = await upstream.text()
    const proxyBase = `${request.nextUrl.origin}/api/proxy`
    const wrap = (value: string) => `${proxyBase}?u=${encodeURIComponent(new URL(value, upstream.url).href)}${referer ? `&r=${encodeURIComponent(referer)}` : ''}`
    const rewritten = text.split(/\r?\n/).map((line) => {
      if (!line.trim()) return line
      if (line.startsWith('#')) return line.replace(/URI="([^"]+)"/g, (_, value) => `URI="${wrap(value)}"`)
      return wrap(line.trim())
    }).join('\n')
    return new NextResponse(rewritten, { status: upstream.status, headers: { 'Content-Type': 'application/vnd.apple.mpegurl', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } })
  }

  const responseHeaders = new Headers({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges' })
  for (const name of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
    const value = upstream.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders })
}
