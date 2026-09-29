import Link from 'next/link'
import { AuthShell } from '@/components/auth-shell'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Verifique seu e-mail"
      description="Enviamos um link de confirmação. Depois de confirmar, é só entrar e comentar."
    >
      <Link
        href="/auth/login"
        className="flex h-11 items-center justify-center bg-primary text-sm font-black uppercase text-primary-foreground transition hover:brightness-110"
      >
        Ir para o login
      </Link>
    </AuthShell>
  )
}
