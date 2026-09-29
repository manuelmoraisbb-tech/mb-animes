'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'

const MAX_LENGTH = 1000

type CommentRow = {
  id: string
  body: string
  created_at: string
  user_id: string
  profiles: { username: string } | null
}

async function fetchComments([, animeSlug, episodeKey]: [string, string, string | null]) {
  const supabase = createClient()
  let query = supabase
    .from('comments')
    .select('id, body, created_at, user_id, profiles(username)')
    .eq('anime_slug', animeSlug)
    .order('created_at', { ascending: false })
    .limit(100)
  query = episodeKey ? query.eq('episode_key', episodeKey) : query.is('episode_key', null)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as CommentRow[]
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function Comments({ animeSlug, episodeKey }: { animeSlug: string; episodeKey: string | null }) {
  const { user } = useUser()
  const { data: comments, error, isLoading, mutate } = useSWR(
    ['comments', animeSlug, episodeKey] as [string, string, string | null],
    fetchComments,
  )
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!user || !text) return
    setSending(true)
    setFormError(null)
    const { error } = await createClient()
      .from('comments')
      .insert({ user_id: user.id, anime_slug: animeSlug, episode_key: episodeKey, body: text.slice(0, MAX_LENGTH) })
    setSending(false)
    if (error) {
      setFormError('Não foi possível publicar. Tente novamente.')
      return
    }
    setBody('')
    mutate()
  }

  async function remove(id: string) {
    await createClient().from('comments').delete().eq('id', id)
    mutate()
  }

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-6">
      <h2 id="comments-heading" className="text-xl font-black">
        {`Comentários${comments ? ` (${comments.length})` : ''}`}
      </h2>

      {user ? (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label htmlFor="comment-body" className="sr-only">
            Escreva um comentário
          </label>
          <div className="flex gap-3">
            <Avatar name={user.username} />
            <textarea
              id="comment-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={3}
              placeholder={`Comentando como ${user.username}...`}
              className="min-h-20 flex-1 resize-y border-b-2 border-input bg-card p-3 text-sm leading-relaxed outline-none transition placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-end gap-4">
            {formError && <p className="text-sm text-primary">{formError}</p>}
            <span className="text-xs text-muted-foreground">{`${body.length}/${MAX_LENGTH}`}</span>
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="h-10 bg-primary px-5 text-xs font-black uppercase text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
            >
              {sending ? 'Publicando...' : 'Comentar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-start gap-3 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Entre na sua conta para participar da conversa.</p>
          <div className="flex gap-2">
            <Link
              href="/auth/sign-up"
              className="flex h-10 items-center border-2 border-primary px-4 text-xs font-black uppercase text-primary transition hover:bg-primary/10"
            >
              Criar conta
            </Link>
            <Link
              href="/auth/login"
              className="flex h-10 items-center bg-primary px-4 text-xs font-black uppercase text-primary-foreground transition hover:brightness-110"
            >
              Entrar
            </Link>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando comentários...</p>
      ) : error ? (
        <p className="text-sm text-muted-foreground">Não foi possível carregar os comentários.</p>
      ) : comments && comments.length > 0 ? (
        <ul className="flex flex-col gap-6">
          {comments.map((c) => {
            const name = c.profiles?.username ?? 'otaku'
            return (
              <li key={c.id} className="flex gap-3">
                <Avatar name={name} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{name}</span>
                    <time dateTime={c.created_at} className="text-xs text-muted-foreground">
                      {dateFormat.format(new Date(c.created_at))}
                    </time>
                    {user?.id === c.user_id && (
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        aria-label="Apagar comentário"
                        className="ml-auto flex size-8 items-center justify-center text-muted-foreground transition hover:text-primary"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-line break-words text-sm leading-relaxed">{c.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Seja o primeiro a comentar.</p>
      )}
    </section>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black uppercase text-primary-foreground"
    >
      {name.charAt(0)}
    </span>
  )
}
