import Link from 'next/link'
import { logoutAction } from '@/app/admin/actions'

export const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'
export const btnCls = 'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90'
export const btnGhostCls = 'inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-bold text-foreground hover:bg-muted'
export const btnDangerCls = 'inline-flex items-center justify-center rounded-md border border-destructive/60 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/10'

export function AdminBar() { return <div className="border-b border-border bg-card"><div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3"><span className="mr-2 font-bold text-primary">MB Admin</span><Link href="/admin" className={btnGhostCls}>Painel</Link><Link href="/admin/novo" className={btnGhostCls}>+ Novo anime</Link><Link href="/" className={btnGhostCls}>Ver site</Link><form action={logoutAction} className="ml-auto"><button className={btnGhostCls}>Sair</button></form></div></div> }
export function Notice({ msg, ok }: { msg?: string; ok?: string }) { if (!msg) return null; const good = ok !== '0'; return <p className={`rounded-md border px-4 py-3 text-sm ${good ? 'border-border bg-card' : 'border-destructive/60 bg-destructive/10 text-destructive'}`}>{msg}</p> }
