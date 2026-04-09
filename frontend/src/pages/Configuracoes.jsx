import { useState } from 'react'
import { Settings, Lock, User, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Configuracoes() {
  const { usuario } = useAuth()
  const [senhas, setSenhas] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [salvando, setSalvando] = useState(false)

  const alterarSenha = async (e) => {
    e.preventDefault()
    if (senhas.novaSenha !== senhas.confirmar) { toast.error('As senhas não conferem'); return }
    if (senhas.novaSenha.length < 6) { toast.error('A nova senha deve ter ao menos 6 caracteres'); return }
    setSalvando(true)
    try {
      await api.put('/auth/alterar-senha', { senhaAtual: senhas.senhaAtual, novaSenha: senhas.novaSenha })
      toast.success('Senha alterada com sucesso!')
      setSenhas({ senhaAtual: '', novaSenha: '', confirmar: '' })
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao alterar senha')
    } finally { setSalvando(false) }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Perfil */}
      <div className="card">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-violet-600" /> Meu Perfil
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg shadow-violet-500/30">
            {usuario?.nome?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800">{usuario?.nome}</h4>
            <p className="text-sm text-slate-500">{usuario?.email}</p>
            <span className="mt-1 inline-block text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full capitalize">
              {usuario?.perfil?.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Alterar senha */}
      <div className="card">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-violet-600" /> Alterar Senha
        </h3>
        <form onSubmit={alterarSenha} className="space-y-4">
          <div>
            <label className="label">Senha Atual</label>
            <input type="password" value={senhas.senhaAtual} onChange={(e) => setSenhas(p => ({ ...p, senhaAtual: e.target.value }))} className="input" placeholder="••••••••" required />
          </div>
          <div>
            <label className="label">Nova Senha</label>
            <input type="password" value={senhas.novaSenha} onChange={(e) => setSenhas(p => ({ ...p, novaSenha: e.target.value }))} className="input" placeholder="••••••••" required minLength={6} />
          </div>
          <div>
            <label className="label">Confirmar Nova Senha</label>
            <input type="password" value={senhas.confirmar} onChange={(e) => setSenhas(p => ({ ...p, confirmar: e.target.value }))} className="input" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-60">
            <CheckCircle2 className="w-4 h-4" /> {salvando ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>

      {/* Info do sistema */}
      <div className="card bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-violet-600" /> Sobre o Sistema
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Sistema', value: 'Gestão Pedagógica POT' },
            { label: 'Versão', value: '1.0.0' },
            { label: 'Projeto', value: 'Projeto POT — Transformando Vidas' },
            { label: 'Tecnologia', value: 'React + Node.js + PostgreSQL' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-slate-500 text-xs mb-0.5">{label}</p>
              <p className="font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
