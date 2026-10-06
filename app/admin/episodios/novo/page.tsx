'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAllAnimes, type Anime } from '@/lib/catalog'

export default function NewEpisodePage() {
  const router = useRouter()
  const [animes, setAnimes] = useState<Anime[]>([])
  const [form, setForm] = useState({
    animeSlug: '',
    season: '1',
    episodeNumber: '',
    episodeName: '',
    episodeUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const list = getAllAnimes()
    setAnimes(list)
    if (list[0]) {
      setForm((value) => ({ ...value, animeSlug: list[0].slug }))
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/admin/episodios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const payload = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(payload.error || 'Erro ao criar episódio')
      return
    }

    router.push('/admin/episodios')
    router.refresh()
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-3xl font-black">Novo episódio</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Anime</label>
          <select
            value={form.animeSlug}
            onChange={(e) => setForm({ ...form, animeSlug: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            {animes.map((anime) => (
              <option key={anime.slug} value={anime.slug}>{anime.title}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Temporada</label>
            <input
              type="number"
              min="1"
              value={form.season}
              onChange={(e) => setForm({ ...form, season: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Número</label>
            <input
              type="number"
              min="1"
              value={form.episodeNumber}
              onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Nome do episódio</label>
          <input
            value={form.episodeName}
            onChange={(e) => setForm({ ...form, episodeName: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="Episódio 1"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">URL do episódio</label>
          <input
            type="url"
            value={form.episodeUrl}
            onChange={(e) => setForm({ ...form, episodeUrl: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="https://..."
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? 'Salvando...' : 'Salvar episódio'}
        </button>
      </form>
    </div>
  )
}
