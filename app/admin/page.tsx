import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AdminDashboard } from '@/components/admin-dashboard'

export const metadata = {
  title: 'Painel de administração | MB Animes',
  description: 'Gere o catálogo do MB Animes e importa novos conteúdos.',
}

export default function AdminPage() {
  return <><SiteHeader /><main><AdminDashboard /></main><SiteFooter /></>
}
