import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Layers, CheckCircle2, Award, TrendingUp, ArrowRight,
  BookOpen, Calendar,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import api from '../services/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className={`card flex items-center gap-4 ${color} text-white`}>
      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-3xl font-extrabold leading-none">{value}</p>
        <p className="text-sm font-medium opacity-90 mt-0.5">{label}</p>
        {sub && <p className="text-xs opacity-75 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-indigo-950 text-white px-3 py-2 rounded-xl text-xs shadow-xl">
        <p className="font-semibold">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}{p.name === 'taxa' ? '%' : ''}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { stats, matriculasPorCurso = [], ultimasMatriculas = [], presencaSemanal = [] } = data || {}

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Beneficiários Ativos" value={stats?.beneficiariosAtivos ?? 0} icon={Users} color="bg-gradient-to-br from-blue-500 to-blue-600" sub={`${stats?.totalBeneficiarios ?? 0} no total`} />
        <StatCard label="Turmas Ativas" value={stats?.turmasAtivas ?? 0} icon={Layers} color="bg-gradient-to-br from-violet-500 to-violet-600" sub={`${stats?.totalTurmas ?? 0} no total`} />
        <StatCard label="Taxa de Presença" value={`${stats?.taxaPresenca ?? 0}%`} icon={CheckCircle2} color="bg-gradient-to-br from-emerald-500 to-emerald-600" sub={`${stats?.totalMatriculas ?? 0} matrículas ativas`} />
        <StatCard label="Certificados Emitidos" value={stats?.totalCertificados ?? 0} icon={Award} color="bg-gradient-to-br from-amber-500 to-amber-600" sub="Neste período" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Matrículas por curso */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" />
              Matrículas por Curso
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={matriculasPorCurso} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="total" name="Matrículas" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Presença semanal */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Taxa de Presença Semanal
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={presencaSemanal} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} unit="%" />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Line type="monotone" dataKey="taxa" name="taxa" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cursos rápidos */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          🎓 Cursos do Projeto POT
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { nome: 'Informática', icone: '💻', cor: '#3B82F6' },
            { nome: 'Barbearia', icone: '✂️', cor: '#6B7280' },
            { nome: 'Faça e Venda', icone: '🛍️', cor: '#F59E0B' },
            { nome: 'Costura', icone: '🧵', cor: '#EC4899' },
            { nome: 'Administração', icone: '📋', cor: '#10B981' },
            { nome: 'Transita', icone: '🚗', cor: '#EF4444' },
            { nome: 'Manicure', icone: '💅', cor: '#8B5CF6' },
          ].map((c) => (
            <div
              key={c.nome}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer hover:shadow-sm"
              style={{ borderLeft: `3px solid ${c.cor}` }}
            >
              <span className="text-2xl">{c.icone}</span>
              <span className="text-xs font-medium text-slate-600 text-center leading-tight">{c.nome}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Últimas matrículas */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            Últimas Matrículas
          </h3>
          <Link to="/beneficiarios" className="text-sm text-violet-600 font-medium hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {ultimasMatriculas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Nenhuma matrícula encontrada</p>
        ) : (
          <div className="space-y-3">
            {ultimasMatriculas.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: m.turma.curso.cor + '22' }}
                >
                  {m.turma.curso.icone}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{m.beneficiario.nome}</p>
                  <p className="text-xs text-slate-500">{m.turma.nome}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {format(new Date(m.dataMatricula), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
