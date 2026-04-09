import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Save, Calendar, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'

export default function Presenca() {
  const [turmas, setTurmas] = useState([])
  const [turmaSelecionada, setTurmaSelecionada] = useState('')
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [conteudo, setConteudo] = useState('')
  const [presencas, setPresencas] = useState([])
  const [aula, setAula] = useState(null)
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    api.get('/turmas', { params: { status: 'ATIVA' } })
      .then(r => setTurmas(r.data))
      .catch(() => toast.error('Erro ao carregar turmas'))
  }, [])

  const buscarPresencas = async () => {
    if (!turmaSelecionada || !data) return
    setLoading(true)
    try {
      const { data: res } = await api.get('/presenca', {
        params: { turmaId: turmaSelecionada, data },
      })
      setAula(res.aula)
      setConteudo(res.aula?.conteudo || '')
      setPresencas(res.matriculas.map(m => ({
        matriculaId: m.matriculaId,
        beneficiario: m.beneficiario,
        presente: m.presente ?? false,
        justificativa: m.justificativa || '',
      })))
    } catch {
      toast.error('Erro ao buscar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { buscarPresencas() }, [turmaSelecionada, data])

  const togglePresenca = (matriculaId) => {
    setPresencas(prev =>
      prev.map(p => p.matriculaId === matriculaId ? { ...p, presente: !p.presente } : p)
    )
  }

  const marcarTodos = (presente) => {
    setPresencas(prev => prev.map(p => ({ ...p, presente })))
  }

  const salvar = async () => {
    if (!turmaSelecionada || !data || presencas.length === 0) {
      toast.error('Selecione turma e data primeiro'); return
    }
    setSalvando(true)
    try {
      await api.post('/presenca', {
        turmaId: Number(turmaSelecionada),
        data,
        conteudo,
        presencas: presencas.map(p => ({ matriculaId: p.matriculaId, presente: p.presente, justificativa: p.justificativa })),
      })
      toast.success('Presença registrada com sucesso!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const presentesCount = presencas.filter(p => p.presente).length
  const ausentesCount = presencas.filter(p => !p.presente).length
  const taxaPresenca = presencas.length > 0 ? Math.round((presentesCount / presencas.length) * 100) : 0

  const turmaSel = turmas.find(t => String(t.id) === String(turmaSelecionada))

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Seleção de turma e data */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Turma</label>
            <select value={turmaSelecionada} onChange={(e) => setTurmaSelecionada(e.target.value)} className="input">
              <option value="">Selecione a turma...</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>{t.curso.icone} {t.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Data da Aula</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Conteúdo da Aula</label>
            <input value={conteudo} onChange={(e) => setConteudo(e.target.value)} className="input" placeholder="Tópico da aula..." />
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {presencas.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center py-4">
            <p className="text-3xl font-extrabold text-emerald-600">{presentesCount}</p>
            <p className="text-sm text-slate-500 mt-1">Presentes</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-extrabold text-red-500">{ausentesCount}</p>
            <p className="text-sm text-slate-500 mt-1">Ausentes</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-extrabold text-violet-600">{taxaPresenca}%</p>
            <p className="text-sm text-slate-500 mt-1">Taxa de Presença</p>
          </div>
        </div>
      )}

      {/* Lista de presença */}
      {turmaSelecionada && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-violet-600" />
              Lista de Chamada
              {turmaSel && (
                <span className="text-sm font-normal text-slate-500 ml-1">
                  — {turmaSel.nome} · {data ? format(new Date(data + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR }) : ''}
                </span>
              )}
            </h3>
            {presencas.length > 0 && (
              <div className="flex gap-2">
                <button onClick={() => marcarTodos(true)} className="text-xs text-emerald-600 hover:underline font-medium">Marcar todos</button>
                <span className="text-slate-300">|</span>
                <button onClick={() => marcarTodos(false)} className="text-xs text-red-500 hover:underline font-medium">Desmarcar todos</button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : presencas.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400">Nenhum beneficiário matriculado nesta turma</p>
            </div>
          ) : (
            <div className="space-y-2">
              {presencas.map((p, i) => (
                <div key={p.matriculaId} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  p.presente
                    ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-red-50 border-red-100 hover:bg-red-100'
                }`} onClick={() => togglePresenca(p.matriculaId)}>
                  <span className="w-7 h-7 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-400 flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {p.beneficiario.nome.charAt(0)}
                  </div>
                  <span className="flex-1 font-medium text-slate-800 text-sm">{p.beneficiario.nome}</span>
                  <div className="flex-shrink-0">
                    {p.presente ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {presencas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={salvar} disabled={salvando} className="btn-primary disabled:opacity-60">
                <Save className="w-4 h-4" />
                {salvando ? 'Salvando...' : 'Salvar Presença'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
