import { useEffect, useState } from 'react'
import { Plus, Pencil, X, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const EMPTY_FORM = { nome: '', email: '', telefone: '', especialidade: '', cpf: '', ativo: true }

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

export default function Instrutores() {
  const [instrutores, setInstrutores] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [salvando, setSalvando] = useState(false)

  const carregar = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/instrutores')
      setInstrutores(data)
    } catch { toast.error('Erro ao carregar instrutores') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  const abrirModal = (inst = null) => {
    setEditando(inst)
    setForm(inst ? { ...inst } : EMPTY_FORM)
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setEditando(null) }

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.email) { toast.error('Nome e email são obrigatórios'); return }
    setSalvando(true)
    try {
      if (editando) {
        await api.put(`/instrutores/${editando.id}`, form)
        toast.success('Instrutor atualizado!')
      } else {
        await api.post('/instrutores', form)
        toast.success('Instrutor cadastrado!')
      }
      fecharModal(); carregar()
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao salvar')
    } finally { setSalvando(false) }
  }

  const desativar = async (id, nome) => {
    if (!confirm(`Desativar ${nome}?`)) return
    try { await api.delete(`/instrutores/${id}`); toast.success('Instrutor desativado'); carregar() }
    catch { toast.error('Erro ao desativar') }
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => abrirModal()} className="btn-primary"><Plus className="w-4 h-4" /> Novo Instrutor</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {instrutores.map((inst) => (
            <div key={inst.id} className={`card group hover:shadow-md transition-all ${!inst.ativo ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xl font-bold flex items-center justify-center">
                  {inst.nome.charAt(0)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => abrirModal(inst)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {inst.ativo && (
                    <button onClick={() => desativar(inst.id, inst.nome)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-0.5">{inst.nome}</h3>
              {inst.especialidade && <p className="text-xs text-violet-600 font-medium mb-3">{inst.especialidade}</p>}
              <div className="space-y-1.5">
                {inst.telefone && (
                  <a href={`tel:${inst.telefone}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {inst.telefone}
                  </a>
                )}
                <a href={`mailto:${inst.email}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {inst.email}
                </a>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">{inst._count?.turmas ?? 0} turma(s)</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inst.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {inst.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalAberto} onClose={fecharModal} title={editando ? 'Editar Instrutor' : 'Novo Instrutor'}>
        <form onSubmit={salvar} className="p-6 space-y-4">
          <div>
            <label className="label">Nome Completo *</label>
            <input value={form.nome} onChange={f('nome')} className="input" placeholder="Nome do instrutor" required />
          </div>
          <div>
            <label className="label">E-mail *</label>
            <input type="email" value={form.email} onChange={f('email')} className="input" placeholder="email@exemplo.com" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Telefone</label>
              <input value={form.telefone || ''} onChange={f('telefone')} className="input" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="label">CPF</label>
              <input value={form.cpf || ''} onChange={f('cpf')} className="input" placeholder="000.000.000-00" />
            </div>
          </div>
          <div>
            <label className="label">Especialidade</label>
            <input value={form.especialidade || ''} onChange={f('especialidade')} className="input" placeholder="Ex: Informática e Tecnologia" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-60">
              {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
