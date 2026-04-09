import { useEffect, useState } from 'react'
import { Plus, Pencil, X, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const EMPTY_FORM = { nome: '', descricao: '', cargaHoraria: '', icone: '📚', cor: '#7C3AED', ativo: true }

const ICONES = ['💻', '✂️', '🛍️', '🧵', '📋', '🚗', '💅', '📚', '🎨', '🔧', '🍳', '💼', '🌱', '🎵']

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

export default function Cursos() {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [salvando, setSalvando] = useState(false)

  const carregar = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/cursos')
      setCursos(data)
    } catch { toast.error('Erro ao carregar cursos') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  const abrirModal = (curso = null) => {
    setEditando(curso)
    setForm(curso ? { ...curso, cargaHoraria: String(curso.cargaHoraria) } : EMPTY_FORM)
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setEditando(null) }

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.cargaHoraria) { toast.error('Nome e carga horária são obrigatórios'); return }
    setSalvando(true)
    try {
      const payload = { ...form, cargaHoraria: Number(form.cargaHoraria) }
      if (editando) {
        await api.put(`/cursos/${editando.id}`, payload)
        toast.success('Curso atualizado!')
      } else {
        await api.post('/cursos', payload)
        toast.success('Curso criado!')
      }
      fecharModal(); carregar()
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao salvar')
    } finally { setSalvando(false) }
  }

  const desativar = async (id, nome) => {
    if (!confirm(`Desativar o curso "${nome}"?`)) return
    try { await api.delete(`/cursos/${id}`); toast.success('Curso desativado'); carregar() }
    catch { toast.error('Erro ao desativar') }
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => abrirModal()} className="btn-primary"><Plus className="w-4 h-4" /> Novo Curso</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cursos.map((c) => (
            <div key={c.id} className="card hover:shadow-md transition-all group" style={{ borderTop: `4px solid ${c.cor}` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: c.cor + '22' }}>
                  {c.icone || '📚'}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => abrirModal(c)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => desativar(c.id, c.nome)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{c.nome}</h3>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.descricao || 'Sem descrição'}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                  ⏱ {c.cargaHoraria}h
                </span>
                <span className="text-xs text-slate-400">{c._count?.turmas ?? 0} turma(s)</span>
              </div>
              {!c.ativo && (
                <span className="mt-2 inline-block text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">Inativo</span>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalAberto} onClose={fecharModal} title={editando ? 'Editar Curso' : 'Novo Curso'}>
        <form onSubmit={salvar} className="p-6 space-y-4">
          <div>
            <label className="label">Nome do Curso *</label>
            <input value={form.nome} onChange={f('nome')} className="input" placeholder="Ex: Informática" required />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea value={form.descricao || ''} onChange={f('descricao')} className="input" rows={2} placeholder="Descrição do curso..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Carga Horária (horas) *</label>
              <input type="number" value={form.cargaHoraria} onChange={f('cargaHoraria')} className="input" placeholder="120" min={1} required />
            </div>
            <div>
              <label className="label">Cor</label>
              <div className="flex gap-2">
                <input type="color" value={form.cor} onChange={f('cor')} className="h-9 w-16 cursor-pointer rounded-lg border border-slate-200" />
                <input value={form.cor} onChange={f('cor')} className="input flex-1" placeholder="#7C3AED" />
              </div>
            </div>
          </div>
          <div>
            <label className="label">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICONES.map((ic) => (
                <button type="button" key={ic} onClick={() => setForm(p => ({ ...p, icone: ic }))}
                  className={`w-10 h-10 rounded-xl text-xl transition-all ${form.icone === ic ? 'bg-violet-100 ring-2 ring-violet-500' : 'hover:bg-slate-100'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-60">
              {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar Curso'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
