'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { AuthField, AuthShell, authButtonClass } from '@/components/auth-shell'

function loginErrorMessage(error: unknown) {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'email_not_confirmed') return 'Confirme seu e-mail — verifique a caixa de entrada.'
  if (code === 'over_request_rate_limit' || status === 429) return 'Muitas tentativas. Aguarde um pouco.'
  if (code === 'invalid_credentials') return 'E-mail ou senha inválidos.'
  return 'Algo deu errado. Tente novamente.'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(loginErrorMessage(error))
      return
    }
    await mutate('auth-user')
    router.push('/')
    router.refresh()
  }

  return (
    <AuthShell title="Entrar" description="Entre para comentar nos seus animes favoritos.">
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <AuthField id="email" label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthField id="password" label="Senha" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-primary">{error}</p>}
        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {'Não tem conta? '}
        <Link href="/auth/sign-up" className="font-bold text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthShell>
  )
}
