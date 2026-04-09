import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardCheck,
  UserSquare2, BarChart3, Award, Settings, LogOut, Layers,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/beneficiarios', label: 'Beneficiários', icon: Users },
  { path: '/cursos', label: 'Cursos', icon: BookOpen },
  { path: '/turmas', label: 'Turmas', icon: Layers },
  { path: '/presenca', label: 'Presença', icon: ClipboardCheck },
  { path: '/instrutores', label: 'Instrutores', icon: UserSquare2 },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/certificados', label: 'Certificados', icon: Award },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-indigo-950 via-violet-950 to-indigo-950 text-white flex flex-col flex-shrink-0 shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight tracking-tight">Sistema POT</h1>
            <p className="text-xs text-violet-300 font-medium">Gestão Pedagógica</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                isActive
                  ? 'bg-violet-600/80 text-white shadow-sm shadow-violet-500/20'
                  : 'text-indigo-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer user info */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-violet-500/40 flex items-center justify-center text-sm font-bold text-violet-200 flex-shrink-0">
            {usuario?.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{usuario?.nome}</p>
            <p className="text-xs text-violet-400 truncate capitalize">{usuario?.perfil?.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-medium"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sair
        </button>
      </div>
    </aside>
  )
}
