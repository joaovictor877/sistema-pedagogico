import { useEffect, useState } from 'react'
import { Plus, Pencil, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']

const STATUS_COLORS = {
  ATIVA: 'bg-emerald-100 text-emerald-700',
  SUSPENSA: 'bg-amber-100 text-amber-700',
  CONCLUIDA: 'bg-blue-100 text-blue-700',
}

const EMPTY_FORM = {
  nome: '', cursoId: '', instrutorId: '', diasSemana: [], horario: '',
  sala: '', vagas: 20, status: 'ATIVA', dataInicio: '', dataFim: '',
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

export default function Turmas() {
  const [turmas, setTurmas] = useState([])
  const [cursos, setCursos] = useState([])
  const [instrutores, setInstrutores] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtrosCurso, setFiltrosCurso] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [salvando, setSalvando] = useState(false)

  const carregar = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtroStatus) params.status = filtroStatus
      if (filtrosCurso) params.cursoId = filtrosCurso
      const [turmasRes, cursosRes, instutoresRes] = await Promise.all([
        api.get('/turmas', { params }),
        api.get('/cursos'),
        api.get('/instrutores')
      ])
      setTurmas(turmasRes.data)
      setCursos(cursosRes.data)
      setInstrutores(instutoresRes.data)
    } catch { toast.error('Erro ao carregar') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [filtroStatus, filtrosCurso])

  const abrirModal = (turma = null) => {
    setEditando(turma)
    if (turma) {
      let dias = []
      try { dias = JSON.parse(turma.diasSemana) } catch { dias = [] }
      setForm({
        ...EMPTY_FORM, ...turma,
        diasSemana: dias,
        cursoId: String(turma.cursoId),
        instrutorId: String(turma.instrutorId),
        vagas: turma.vagas,
        dataInicio: turma.dataInicio ? turma.dataInicio.split('T')[0] : '',
        dataFim: turma.dataFim ? turma.dataFim.split('T')[0] : '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setEditando(null) }

  const toggleDia = (dia) => {
    setForm(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia]
    }))
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.cursoId || !form.instrutorId || !form.horario) {
      toast.error('Preencha os campos obrigatórios'); return
    }
    setSalvando(true)
    try {
      const payload = {
        ...form,
        cursoId: Number(form.cursoId),
        instrutorId: Number(form.instrutorId),
        vagas: Number(form.vagas),
        diasSemana: JSON.stringify(form.diasSemana),
        dataInicio: form.dataInicio ? new Date(form.dataInicio + 'T12:00:00') : null,
        dataFim: form.dataFim ? new Date(form.dataFim + 'T12:00:00') : null,
      }
      if (editando) {
        await api.put(`/turmas/${editando.id}`, payload)
        toast.success('Turma atualizada!')
      } else {
        await api.post('/turmas', payload)
        toast.success('Turma criada!')
      }
      fecharModal(); carregar()
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao salvar')
    } finally { setSalvando(false) }
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="input w-36">
            <option value="">Todos status</option>
            <option value="ATIVA">Ativas</option>
            <option value="SUSPENSA">Suspensas</option>
            <option value="CONCLUIDA">Concluídas</option>
          </select>
          <select value={filtrosCurso} onChange={(e) => setFiltrosCurso(e.target.value)} className="input w-44">
            <option value="">Todos cursos</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
          </select>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus className="w-4 h-4" /> Nova Turma</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Turma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Curso</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Instrutor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Horário</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vagas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {turmas.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Nenhuma turma encontrada</td></tr>
              ) : turmas.map((t) => {
                let dias = []
                try { dias = JSON.parse(t.diasSemana) } catch { dias = [] }
                return (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-violet-50/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{t.nome}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: t.curso.cor + '22', color: t.curso.cor }}>
                        {t.curso.icone} {t.curso.nome}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.instrutor.nome}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700 font-medium">{t.horario}</p>
                      <p className="text-xs text-slate-400">{dias.map(d => d.substring(0, 3)).join(', ')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Users className="w-3.5 h-3.5" /> {t._count?.matriculas ?? 0}/{t.vagas}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => abrirModal(t)} className="p-1.5 hover:bg-violet-100 text-violet-600 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalAberto} onClose={fecharModal} title={editando ? 'Editar Turma' : 'Nova Turma'}>
        <form onSubmit={salvar} className="p-6 space-y-4">
          <div>
            <label className="label">Nome da Turma *</label>
            <input value={form.nome} onChange={f('nome')} className="input" placeholder="Ex: Informática - Manhã" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Curso *</label>
              <select value={form.cursoId} onChange={f('cursoId')} className="input" required>
                <option value="">Selecione...</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Instrutor *</label>
              <select value={form.instrutorId} onChange={f('instrutorId')} className="input" required>
                <option value="">Selecione...</option>
                {instrutores.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Dias da Semana</label>
            <div className="flex flex-wrap gap-2">
              {DIAS.map((dia) => (
                <button type="button" key={dia} onClick={() => toggleDia(dia)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                    form.diasSemana.includes(dia)
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                  }`}>
                  {dia}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Horário *</label>
              <input value={form.horario} onChange={f('horario')} className="input" placeholder="08:00 - 10:00" required />
            </div>
            <div>
              <label className="label">Sala</label>
              <input value={form.sala || ''} onChange={f('sala')} className="input" placeholder="Sala / Laboratório" />
            </div>
            <div>
              <label className="label">Vagas</label>
              <input type="number" value={form.vagas} onChange={f('vagas')} className="input" min={1} />
            </div>
            {editando && (
              <div>
                <label className="label">Status</label>
                <select value={form.status} onChange={f('status')} className="input">
                  <option value="ATIVA">Ativa</option>
                  <option value="SUSPENSA">Suspensa</option>
                  <option value="CONCLUIDA">Concluída</option>
                </select>
              </div>
            )}
            <div>
              <label className="label">Data Início</label>
              <input type="date" value={form.dataInicio} onChange={f('dataInicio')} className="input" />
            </div>
            <div>
              <label className="label">Data Fim</label>
              <input type="date" value={form.dataFim} onChange={f('dataFim')} className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-60">
              {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar Turma'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
