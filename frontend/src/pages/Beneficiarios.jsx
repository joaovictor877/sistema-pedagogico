import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, UserCheck, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import api from '../services/api'

const STATUS_COLORS = {
  ATIVO: 'bg-emerald-100 text-emerald-700',
  INATIVO: 'bg-slate-100 text-slate-500',
  CONCLUIDO: 'bg-blue-100 text-blue-700',
}

const STATUS_LABELS = { ATIVO: 'Ativo', INATIVO: 'Inativo', CONCLUIDO: 'Concluído' }

const SEXO_LABELS = { MASCULINO: 'Masculino', FEMININO: 'Feminino', OUTRO: 'Outro' }

const EMPTY_FORM = {
  nome: '', cpf: '', rg: '', dataNasc: '', sexo: 'MASCULINO',
  telefone: '', email: '', endereco: '', bairro: '', cidade: 'São Paulo',
  responsavel: '', telResponsavel: '', observacoes: '', status: 'ATIVO',
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

export default function Beneficiarios() {
  const [beneficiarios, setBeneficiarios] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [salvando, setSalvando] = useState(false)

  const carregar = async (pg = pagina) => {
    setLoading(true)
    try {
      const params = { pagina: pg, limite: 10 }
      if (busca) params.busca = busca
      if (statusFiltro) params.status = statusFiltro
      const { data } = await api.get('/beneficiarios', { params })
      setBeneficiarios(data.dados)
      setTotal(data.total)
      setTotalPaginas(data.totalPaginas)
    } catch {
      toast.error('Erro ao carregar beneficiários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar(1); setPagina(1) }, [busca, statusFiltro])
  useEffect(() => { carregar(pagina) }, [pagina])

  const abrirModal = (benef = null) => {
    if (benef) {
      setEditando(benef)
      setForm({
        ...EMPTY_FORM, ...benef,
        dataNasc: benef.dataNasc ? format(new Date(benef.dataNasc), 'yyyy-MM-dd') : '',
      })
    } else {
      setEditando(null)
      setForm(EMPTY_FORM)
    }
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setEditando(null) }

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.cpf || !form.dataNasc) {
      toast.error('Nome, CPF e data de nascimento são obrigatórios')
      return
    }
    setSalvando(true)
    try {
      const payload = { ...form, dataNasc: new Date(form.dataNasc + 'T12:00:00') }
      if (editando) {
        await api.put(`/beneficiarios/${editando.id}`, payload)
        toast.success('Beneficiário atualizado!')
      } else {
        await api.post('/beneficiarios', payload)
        toast.success('Beneficiário cadastrado!')
      }
      fecharModal()
      carregar(pagina)
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const remover = async (id, nome) => {
    if (!confirm(`Deseja inativar ${nome}?`)) return
    try {
      await api.delete(`/beneficiarios/${id}`)
      toast.success('Beneficiário inativado')
      carregar(pagina)
    } catch {
      toast.error('Erro ao inativar')
    }
  }

  const f = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou CPF..."
              className="input pl-9 w-64"
            />
          </div>
          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="input w-36">
            <option value="">Todos</option>
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
            <option value="CONCLUIDO">Concluídos</option>
          </select>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Beneficiário
        </button>
      </div>

      {/* Counter */}
      <p className="text-sm text-slate-500">{total} beneficiário(s) encontrado(s)</p>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">CPF</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cursos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : beneficiarios.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">Nenhum beneficiário encontrado</td></tr>
              ) : beneficiarios.map((b) => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-violet-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {b.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{b.nome}</p>
                        <p className="text-xs text-slate-400">{b.telefone || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{b.cpf}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {b.matriculas?.slice(0, 2).map((m) => (
                        <span key={m.id} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: m.turma.curso.cor + '22', color: m.turma.curso.cor }}>
                          {m.turma.curso.icone} {m.turma.curso.nome}
                        </span>
                      ))}
                      {b.matriculas?.length > 2 && <span className="text-xs text-slate-400">+{b.matriculas.length - 2}</span>}
                      {b.matriculas?.length === 0 && <span className="text-xs text-slate-400">Sem matrícula</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[b.status]}`}>
                      {STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => abrirModal(b)} className="p-1.5 hover:bg-violet-100 text-violet-600 rounded-lg transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => remover(b.id, b.nome)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="Inativar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Página {pagina} de {totalPaginas}</p>
            <div className="flex gap-2">
              <button disabled={pagina === 1} onClick={() => setPagina(p => p - 1)} className="btn-secondary py-1.5 px-2.5 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)} className="btn-secondary py-1.5 px-2.5 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalAberto} onClose={fecharModal} title={editando ? 'Editar Beneficiário' : 'Novo Beneficiário'}>
        <form onSubmit={salvar} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Row label="Nome Completo *">
                <input value={form.nome} onChange={f('nome')} className="input" placeholder="Nome completo" required />
              </Row>
            </div>
            <Row label="CPF *">
              <input value={form.cpf} onChange={f('cpf')} className="input" placeholder="000.000.000-00" required />
            </Row>
            <Row label="RG">
              <input value={form.rg || ''} onChange={f('rg')} className="input" placeholder="00.000.000-0" />
            </Row>
            <Row label="Data de Nascimento *">
              <input type="date" value={form.dataNasc} onChange={f('dataNasc')} className="input" required />
            </Row>
            <Row label="Sexo">
              <select value={form.sexo} onChange={f('sexo')} className="input">
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </Row>
            <Row label="Telefone">
              <input value={form.telefone || ''} onChange={f('telefone')} className="input" placeholder="(11) 99999-9999" />
            </Row>
            <Row label="E-mail">
              <input type="email" value={form.email || ''} onChange={f('email')} className="input" placeholder="email@exemplo.com" />
            </Row>
            <div className="col-span-2">
              <Row label="Endereço">
                <input value={form.endereco || ''} onChange={f('endereco')} className="input" placeholder="Rua, nº, complemento" />
              </Row>
            </div>
            <Row label="Bairro">
              <input value={form.bairro || ''} onChange={f('bairro')} className="input" placeholder="Bairro" />
            </Row>
            <Row label="Cidade">
              <input value={form.cidade} onChange={f('cidade')} className="input" placeholder="Cidade" />
            </Row>
            <Row label="Responsável">
              <input value={form.responsavel || ''} onChange={f('responsavel')} className="input" placeholder="Nome do responsável" />
            </Row>
            <Row label="Tel. Responsável">
              <input value={form.telResponsavel || ''} onChange={f('telResponsavel')} className="input" placeholder="(11) 99999-9999" />
            </Row>
            {editando && (
              <Row label="Status">
                <select value={form.status} onChange={f('status')} className="input">
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="CONCLUIDO">Concluído</option>
                </select>
              </Row>
            )}
            <div className="col-span-2">
              <Row label="Observações">
                <textarea value={form.observacoes || ''} onChange={f('observacoes')} className="input" rows={2} placeholder="Anotações gerais..." />
              </Row>
            </div>
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
