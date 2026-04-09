import { useEffect, useState } from 'react'
import { Plus, Pencil, X, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const PERFIS = ['ADMIN', 'PEDAGOGICO', 'EDUCADOR']

const PERFIL_COLORS = {
  ADMIN: 'bg-red-100 text-red-700',
  PEDAGOGICO: 'bg-violet-100 text-violet-700',
  EDUCADOR: 'bg-emerald-100 text-emerald-700',
}

const EMPTY_FORM = { nome: '', email: '', senha: '', perfil: 'PEDAGOGICO' }

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Usuarios() {
  const { usuario: usuarioLogado } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [salvando, setSalvando] = useState(false)

  if (usuarioLogado?.perfil !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <ShieldCheck className="w-16 h-16 mb-4 text-slate-300" />
        <p className="text-lg font-medium">Acesso restrito a administradores</p>
      </div>
    )
  }

  const carregar = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/usuarios')
      setUsuarios(data)
    } catch { toast.error('Erro ao carregar usuários') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  const abrirModal = (u = null) => {
    setEditando(u)
    setForm(u ? { nome: u.nome, email: u.email, senha: '', perfil: u.perfil } : EMPTY_FORM)
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setEditando(null) }

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.email) { toast.error('Nome e email são obrigatórios'); return }
    if (!editando && !form.senha) { toast.error('Senha é obrigatória para novo usuário'); return }
    setSalvando(true)
    try {
      const payload = editando
        ? { nome: form.nome, email: form.email, perfil: form.perfil, ativo: true }
        : form
      if (editando) {
        await api.put(`/usuarios/${editando.id}`, payload)
        toast.success('Usuário atualizado!')
      } else {
        await api.post('/usuarios', payload)
        toast.success('Usuário criado!')
      }
      fecharModal(); carregar()
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao salvar')
    } finally { setSalvando(false) }
  }

  const desativar = async (id, nome) => {
    if (!confirm(`Desativar ${nome}?`)) return
    try { await api.delete(`/usuarios/${id}`); toast.success('Usuário desativado'); carregar() }
    catch (err) { toast.error(err.response?.data?.mensagem || 'Erro ao desativar') }
  }

  const reativar = async (id) => {
    try {
      await api.put(`/usuarios/${id}`, { ativo: true })
      toast.success('Usuário reativado'); carregar()
    } catch { toast.error('Erro ao reativar') }
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => abrirModal()} className="btn-primary"><Plus className="w-4 h-4" /> Novo Usuário</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">E-mail</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Perfil</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">Nenhum usuário encontrado</td></tr>
              ) : usuarios.map((u) => (
                <tr key={u.id} className={`border-b border-slate-50 hover:bg-violet-50/40 transition-colors ${!u.ativo ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{u.nome}</span>
                      {u.id === usuarioLogado?.id && <span className="text-xs text-slate-400">(você)</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PERFIL_COLORS[u.perfil] || 'bg-slate-100 text-slate-600'}`}>
                      {u.perfil.charAt(0) + u.perfil.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => abrirModal(u)} className="p-1.5 hover:bg-violet-100 text-violet-600 rounded-lg transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {u.id !== usuarioLogado?.id && u.ativo && (
                        <button onClick={() => desativar(u.id, u.nome)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="Desativar">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {!u.ativo && (
                        <button onClick={() => reativar(u.id)} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors">
                          Reativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalAberto} onClose={fecharModal} title={editando ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={salvar} className="p-6 space-y-4">
          <div>
            <label className="label">Nome Completo *</label>
            <input value={form.nome} onChange={f('nome')} className="input" placeholder="Nome do usuário" required />
          </div>
          <div>
            <label className="label">E-mail *</label>
            <input type="email" value={form.email} onChange={f('email')} className="input" placeholder="email@exemplo.com" required />
          </div>
          {!editando && (
            <div>
              <label className="label">Senha *</label>
              <input type="password" value={form.senha} onChange={f('senha')} className="input" placeholder="Mínimo 6 caracteres" minLength={6} required />
            </div>
          )}
          <div>
            <label className="label">Perfil</label>
            <select value={form.perfil} onChange={f('perfil')} className="input">
              {PERFIS.map(p => (
                <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-60">
              {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
