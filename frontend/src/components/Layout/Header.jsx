import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/beneficiarios': 'Beneficiários',
  '/cursos': 'Cursos',
  '/turmas': 'Turmas',
  '/presenca': 'Registro de Presença',
  '/instrutores': 'Instrutores',
  '/relatorios': 'Relatórios',
  '/certificados': 'Certificados',
  '/configuracoes': 'Configurações',
}

const PAGE_SUBTITLES = {
  '/': 'Visão geral do projeto POT',
  '/beneficiarios': 'Gerencie os participantes do projeto',
  '/cursos': 'Cursos e capacitações oferecidos',
  '/turmas': 'Turmas em andamento',
  '/presenca': 'Controle de frequência das aulas',
  '/instrutores': 'Equipe de instrutores',
  '/relatorios': 'Indicadores e análises pedagógicas',
  '/certificados': 'Emissão e gestão de certificados',
  '/configuracoes': 'Preferências e configurações',
}

export default function Header() {
  const { pathname } = useLocation()

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-800">{PAGE_TITLES[pathname] || 'Sistema POT'}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{PAGE_SUBTITLES[pathname] || ''}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <span className="text-xs text-slate-400">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </span>
      </div>
    </header>
  )
}
