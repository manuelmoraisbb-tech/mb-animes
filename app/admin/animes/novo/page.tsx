'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewAnimePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [poster, setPoster] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/admin/animes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, poster }),
    })

    const payload = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(payload.error || 'Erro ao criar anime')
      return
    }

    router.push('/admin/animes')
    router.refresh()
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-3xl font-black">Novo anime</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="Ex: Solo Leveling"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Pôster</label>
          <input
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="https://..."
            type="url"
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? 'Salvando...' : 'Salvar anime'}
        </button>
      </form>
    </div>
  )
}
