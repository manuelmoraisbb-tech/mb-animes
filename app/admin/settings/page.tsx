'use client'

export default function Settings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">Backup & Sincronização</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Faça backup ou sincronize suas alterações com o repositório GitHub
          </p>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition">
              Fazer Backup
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition">
              Sincronizar com GitHub
            </button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">Usuários Admin</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione ou remova usuários com acesso ao painel administrativo
          </p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition">
            + Adicionar Admin
          </button>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">Informações do Site</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título do Site</label>
              <input
                type="text"
                defaultValue="MB Animes"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                defaultValue="Assista animes online"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                rows={3}
              />
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition">
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
