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

// IPTV panels often gate streams by client type, so try several player identities.
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'VLC/3.0.20 LibVLC/3.0.20',
  'IPTVSmartersPlayer',
  'okhttp/4.12.0',
]

function candidateUrls(target: URL) {
  const urls = [target.toString()]
  if (target.protocol === 'http:') urls.push(target.toString().replace(/^http:/, 'https:'))
  return urls
}

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
  let upstream: Response | null = null

  outer: for (const url of candidateUrls(target)) {
    for (const userAgent of USER_AGENTS) {
      if (request.signal.aborted) break outer
      const response = await fetch(url, {
        headers: { 'user-agent': userAgent, accept: '*/*', ...(range ? { range } : {}) },
        redirect: 'follow',
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(12_000)]),
      }).catch(() => null)
      if (response?.body && response.status < 400) {
        upstream = response
        break outer
      }
      await response?.body?.cancel().catch(() => {})
    }
  }

  if (!upstream) {
    return new Response('Upstream unavailable', { status: 502 })
  }

  const headers = new Headers({ 'cache-control': 'public, max-age=3600' })
  for (const key of FORWARDED_HEADERS) {
    const value = upstream.headers.get(key)
    if (value) headers.set(key, value)
  }
  if (!headers.has('accept-ranges')) headers.set('accept-ranges', 'bytes')

  const downloadName = request.nextUrl.searchParams.get('download')
  if (downloadName) {
    const safe = downloadName.replace(/[\\/:*?"<>|\r\n]+/g, ' ').trim().slice(0, 150) || 'episodio.mp4'
    const ascii = safe.normalize('NFD').replace(/[^\x20-\x7e]/g, '')
    headers.set(
      'content-disposition',
      `attachment; filename="${ascii.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(safe)}`,
    )
  }

  return new Response(upstream.body, { status: upstream.status, headers })
}
