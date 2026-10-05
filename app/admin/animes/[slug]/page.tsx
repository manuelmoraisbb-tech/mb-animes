'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAnimeBySlug, type Anime } from '@/lib/catalog'

export default function EditAnimePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [anime, setAnime] = useState<Anime | null>(null)
  const [title, setTitle] = useState('')
  const [poster, setPoster] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      const { slug } = await params
      const item = getAnimeBySlug(slug)
      if (!item) {
        router.push('/admin/animes')
        return
      }

      setAnime(item)
      setTitle(item.title)
      setPoster(item.poster)
    })()
  }, [params, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!anime) return

    setLoading(true)
    setError('')

    const response = await fetch(`/api/admin/animes/${anime.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, poster }),
    })

    const payload = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(payload.error || 'Erro ao atualizar anime')
      return
    }

    router.push('/admin/animes')
    router.refresh()
  }

  if (!anime) return <div>Carregando...</div>

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-3xl font-black">Editar anime</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Pôster</label>
          <input
            type="url"
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            required
          />
        </div>

        {poster && (
          <img src={poster} alt={title} className="h-48 w-32 rounded-lg object-cover" />
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
