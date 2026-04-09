import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Search, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#EF4444', '#6B7280']

export default function Relatorios() {
  const [turmas, setTurmas] = useState([])
  const [cursos, setCursos] = useState([])
  const [tipoRelatorio, setTipoRelatorio] = useState('presenca')
  const [filtros, setFiltros] = useState({ turmaId: '', cursoId: '', dataInicio: '', dataFim: '' })
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/turmas'), api.get('/cursos')])
      .then(([t, c]) => { setTurmas(t.data); setCursos(c.data) })
      .catch(() => toast.error('Erro ao carregar dados'))
  }, [])

  const buscar = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtros.turmaId) params.turmaId = filtros.turmaId
      if (filtros.cursoId) params.cursoId = filtros.cursoId
      if (filtros.dataInicio) params.dataInicio = filtros.dataInicio
      if (filtros.dataFim) params.dataFim = filtros.dataFim

      const endpoint = tipoRelatorio === 'presenca' ? '/relatorios/presenca' : '/relatorios/matriculas'
      const { data } = await api.get(endpoint, { params })
      setDados(data)
    } catch {
      toast.error('Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  const f = (field) => (e) => setFiltros(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-600" /> Filtros do Relatório
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="label">Tipo</label>
            <select value={tipoRelatorio} onChange={(e) => setTipoRelatorio(e.target.value)} className="input">
              <option value="presenca">Presença</option>
              <option value="matriculas">Matrículas</option>
            </select>
          </div>
          {tipoRelatorio === 'presenca' ? (
            <div>
              <label className="label">Turma</label>
              <select value={filtros.turmaId} onChange={f('turmaId')} className="input">
                <option value="">Todas</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="label">Curso</label>
              <select value={filtros.cursoId} onChange={f('cursoId')} className="input">
                <option value="">Todos</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Data Início</label>
            <input type="date" value={filtros.dataInicio} onChange={f('dataInicio')} className="input" />
          </div>
          <div>
            <label className="label">Data Fim</label>
            <input type="date" value={filtros.dataFim} onChange={f('dataFim')} className="input" />
          </div>
        </div>
        <button onClick={buscar} disabled={loading} className="btn-primary disabled:opacity-60">
          <Search className="w-4 h-4" /> {loading ? 'Gerando...' : 'Gerar Relatório'}
        </button>
      </div>

      {/* Resultados de presença */}
      {dados && tipoRelatorio === 'presenca' && (
        <div className="space-y-4">
          <div className="card">
            <p className="text-sm text-slate-500 mb-4">Total de aulas: <strong className="text-slate-800">{dados.totalAulas}</strong></p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Beneficiário</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Aulas</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Presentes</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Faltou</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.relatorio.map((r) => (
                    <tr key={r.beneficiario.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{r.beneficiario.nome}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{r.totalAulas}</td>
                      <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{r.presentes}</td>
                      <td className="px-4 py-3 text-center text-red-500">{r.ausentes}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${r.taxa}%`, backgroundColor: r.taxa >= 75 ? '#10b981' : r.taxa >= 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: r.taxa >= 75 ? '#10b981' : r.taxa >= 50 ? '#f59e0b' : '#ef4444' }}>{r.taxa}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Resultados de matrículas */}
      {dados && tipoRelatorio === 'matriculas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="font-bold text-slate-800 mb-4">Matrículas por Curso</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={dados.porCurso.map(p => ({ name: p.curso.nome, value: p.total }))}
                  cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {dados.porCurso.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-bold text-slate-800 mb-4">Resumo por Curso</h3>
            <div className="space-y-3">
              {dados.porCurso.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-slate-700 flex-1">{p.curso.icone} {p.curso.nome}</span>
                  <span className="text-sm font-bold text-slate-800">{p.total}</span>
                  <span className="text-xs text-slate-400">({p.ativas} ativas)</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Total: {dados.total} matrículas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
