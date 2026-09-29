import Link from 'next/link'
import { AuthShell } from '@/components/auth-shell'

export default function AuthErrorPage() {
  return (
    <AuthShell title="Algo deu errado" description="O link pode ter expirado. Tente entrar novamente.">
      <Link
        href="/auth/login"
        className="flex h-11 items-center justify-center bg-primary text-sm font-black uppercase text-primary-foreground transition hover:brightness-110"
      >
        Voltar ao login
      </Link>
    </AuthShell>
  )
}
