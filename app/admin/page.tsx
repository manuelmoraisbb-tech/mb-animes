import Link from 'next/link'
import { listAnimes, slugify } from '@/lib/admin'
import { AdminBar, Notice, btnCls, inputCls } from '@/components/admin-ui'

export const metadata = { title: 'Admin | MB Animes', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; msg?: string; ok?: string }> }) {
  const { q = '', msg, ok } = await searchParams; const all = await listAnimes(); const total = all.reduce((sum, anime) => sum + anime.episodes, 0); const needle = slugify(q); const rows = all.filter((anime) => !needle || slugify(anime.title).includes(needle))
  return <><AdminBar /><main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6"><Notice msg={msg} ok={ok} /><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Catálogo Supabase</p><h1 className="mt-2 font-serif text-3xl font-bold">Painel administrativo</h1><p className="mt-1 text-sm text-muted-foreground">{all.length} animes · {total} episódios</p></div><Link href="/admin/novo" className={btnCls}>+ Novo anime</Link></div><form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Procurar anime…" className={inputCls} /><button className={btnCls}>Buscar</button></form><ul className="flex flex-col divide-y divide-border rounded-md border border-border bg-card">{rows.map((anime) => <li key={anime.id}><Link href={`/admin/${anime.slug}`} className="flex items-center gap-3 p-3 hover:bg-muted"><img src={anime.poster || '/placeholder.svg'} alt="" className="h-16 w-11 shrink-0 rounded bg-muted object-cover" /><span className="min-w-0 flex-1"><span className="block truncate font-bold">{anime.title}</span><span className="text-xs text-muted-foreground">{anime.seasons} temporada(s) · {anime.episodes} episódio(s)</span></span><span className="text-sm text-primary">Editar</span></Link></li>)}{rows.length === 0 && <li className="p-4 text-sm text-muted-foreground">Nada encontrado.</li>}</ul></main></>
}
