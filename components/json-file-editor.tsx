'use client'

import { useEffect, useState } from 'react'
import { Check, FileJson, Loader2, Save, WandSparkles } from 'lucide-react'

export function JsonFileEditor() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/links')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setContent(data.content)
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/links', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setContent(data.content)
      setMessage('links.json guardado com sucesso.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível guardar.')
    } finally { setSaving(false) }
  }

  return <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><FileJson className="size-4" />Arquivo do catálogo</p><h2 className="mt-2 font-serif text-2xl font-bold">Editar links.json diretamente</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Edite o catálogo inteiro no editor abaixo. O sistema valida o JSON antes de guardar.</p></div>
      <WandSparkles className="hidden size-6 text-primary sm:block" />
    </div>
    <textarea value={content} onChange={(event) => setContent(event.target.value)} disabled={loading || saving} spellCheck={false} className="mt-5 min-h-[420px] w-full rounded-lg border border-border bg-background p-4 font-mono text-xs leading-6 outline-none focus:border-primary disabled:opacity-60" placeholder={loading ? 'A carregar links.json...' : '{ }'} />
    <div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={() => void save()} disabled={loading || saving || !content.trim()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{saving ? 'A guardar...' : 'Guardar links.json'}</button>{message && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4 text-emerald-500" />{message}</p>}</div>
  </section>
}
