'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthField, AuthShell, authButtonClass } from '@/components/auth-shell'

function signUpErrorMessage(error: unknown) {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'weak_password') return 'Senha fraca. Use pelo menos 6 caracteres.'
  if (code === 'email_address_invalid') return 'E-mail inválido.'
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || status === 429)
    return 'Muitas tentativas. Aguarde um pouco e tente de novo.'
  return 'Não foi possível criar a conta. Tente novamente.'
}

export default function SignUpPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    const name = username.trim()
    if (name.length < 2 || name.length > 30) {
      setError('O nome de usuário deve ter entre 2 e 30 caracteres.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: { username: name },
      },
    })
    setLoading(false)
    if (error) {
      setError(signUpErrorMessage(error))
      return
    }
    router.push('/auth/sign-up-success')
  }

  return (
    <AuthShell title="Criar conta" description="Crie sua conta MB Animes e comente nos episódios.">
      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
        <AuthField id="username" label="Nome de usuário" autoComplete="nickname" required maxLength={30} value={username} onChange={(e) => setUsername(e.target.value)} />
        <AuthField id="email" label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthField id="password" label="Senha" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-primary">{error}</p>}
        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {'Já tem conta? '}
        <Link href="/auth/login" className="font-bold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  )
}
