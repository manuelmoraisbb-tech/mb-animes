import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function resolve(token: string) {
  const body = new URLSearchParams({
    'f.req': JSON.stringify([[['WcwnYd', JSON.stringify([token, '', 0]), null, 'generic']]]),
  })
  const response = await fetch(
    'https://www.blogger.com/_/BloggerVideoPlayerUi/data/batchexecute?rpcids=WcwnYd&rt=c',
    {
      method: 'POST',
      body,
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.blogger.com/' },
    },
  )
  if (!response.ok) return null
  const text = (await response.text())
    .replace(/\\+u003d/g, '=')
    .replace(/\\+u0026/g, '&')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
  const urls = [...new Set(text.match(/https:\/\/[^"\s]+googlevideo\.com\/videoplayback[^"\s]*/g) ?? [])]
  return urls.find((url) => url.includes('itag=22')) ?? urls.find((url) => url.includes('itag=18')) ?? urls[0] ?? null
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const name = (request.nextUrl.searchParams.get('name') ?? 'episodio').replace(/[^\w-]+/g, '_')
  const download = request.nextUrl.searchParams.get('download') === '1'
  if (!token) return new Response('falta o token', { status: 400 })

  const link = await resolve(token)
  if (!link) return new Response('não foi possível gerar o link', { status: 502 })

  const range = request.headers.get('range')
  const upstream = await fetch(link, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Referer: 'https://www.blogger.com/',
      ...(range ? { Range: range } : {}),
    },
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(290_000)]),
  }).catch(() => null)
  if (!upstream || (!upstream.ok && upstream.status !== 206)) return new Response('erro na origem', { status: 502 })

  const headers = new Headers({
    'Content-Type': upstream.headers.get('content-type') ?? 'video/mp4',
    'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${name}.mp4"`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
  })
  for (const key of ['content-length', 'content-range']) {
    const value = upstream.headers.get(key)
    if (value) headers.set(key, value)
  }
  return new Response(upstream.body, { status: upstream.status, headers })
}
