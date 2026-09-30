import Link from 'next/link'
import { AuthShell } from '@/components/auth-shell'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Verifique seu e-mail"
      description="Enviamos um link de confirmação. Depois de confirmar, é só entrar e comentar."
    >
      <p className="bg-secondary p-4 text-center text-sm leading-relaxed text-secondary-foreground">
        O e-mail pode levar até 2 minutos para chegar. Se não aparecer, confira a pasta de spam.
      </p>
      <Link
        href="/auth/login"
        className="flex h-11 items-center justify-center bg-primary text-sm font-black uppercase text-primary-foreground transition hover:brightness-110"
      >
        Ir para o login
      </Link>
    </AuthShell>
  )
}
