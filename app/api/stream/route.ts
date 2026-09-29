import type { NextRequest } from 'next/server'
import { getAllowedVideoHosts } from '@/lib/catalog'

const FORWARDED_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'last-modified',
  'etag',
]

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url')
  if (!raw) return new Response('Missing url', { status: 400 })

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return new Response('Invalid url', { status: 400 })
  }
  // Only proxy hosts that appear in the catalog, so this can't become an open proxy.
  if (!getAllowedVideoHosts().has(target.host)) {
    return new Response('Host not allowed', { status: 403 })
  }

  const range = request.headers.get('range')
  const upstream = await fetch(target, {
    headers: range ? { range } : {},
    signal: request.signal,
  }).catch(() => null)

  if (!upstream || !upstream.body || upstream.status >= 400) {
    return new Response('Upstream unavailable', { status: 502 })
  }

  const headers = new Headers({ 'cache-control': 'public, max-age=3600' })
  for (const key of FORWARDED_HEADERS) {
    const value = upstream.headers.get(key)
    if (value) headers.set(key, value)
  }
  if (!headers.has('accept-ranges')) headers.set('accept-ranges', 'bytes')

  return new Response(upstream.body, { status: upstream.status, headers })
}
