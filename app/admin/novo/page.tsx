import { createAnime } from '../actions'
import { requireAdmin } from '@/lib/admin'
import { AdminBar, Notice, btnCls, inputCls } from '@/components/admin-ui'

export const dynamic = 'force-dynamic'
export default async function NewAnimePage({ searchParams }: { searchParams: Promise<{ msg?: string; ok?: string }> }) { await requireAdmin(); const { msg, ok } = await searchParams; return <><AdminBar /><main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6"><h1 className="font-serif text-2xl font-bold">Novo anime</h1><Notice msg={msg} ok={ok} /><form action={createAnime} className="flex flex-col gap-3 rounded-md border border-border bg-card p-5"><input name="title" placeholder="Título" required className={inputCls} /><input name="poster" placeholder="URL da capa" className={inputCls} /><button className={btnCls}>Criar anime</button></form></main></> }
