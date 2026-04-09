import { useEffect, useState } from 'react'
import { Plus, Award, Printer, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'

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

export default function Certificados() {
  const [certificados, setCertificados] = useState([])
  const [beneficiarios, setBeneficiarios] = useState([])
  const [turmas, setTurmas] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState({ beneficiarioId: '', turmaId: '', observacoes: '' })
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState('')
  const [certSelecionado, setCertSelecionado] = useState(null)

  const carregar = async () => {
    setLoading(true)
    try {
      const [certRes, benefRes, turmaRes] = await Promise.all([
        api.get('/certificados'),
        api.get('/beneficiarios', { params: { limite: 100 } }),
        api.get('/turmas')
      ])
      setCertificados(certRes.data)
      setBeneficiarios(benefRes.data.dados)
      setTurmas(turmaRes.data)
    } catch { toast.error('Erro ao carregar') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  const emitir = async (e) => {
    e.preventDefault()
    if (!form.beneficiarioId || !form.turmaId) { toast.error('Selecione beneficiário e turma'); return }
    setSalvando(true)
    try {
      const { data } = await api.post('/certificados', {
        beneficiarioId: Number(form.beneficiarioId),
        turmaId: Number(form.turmaId),
        observacoes: form.observacoes,
      })
      toast.success('Certificado emitido com sucesso!')
      setModalAberto(false)
      setForm({ beneficiarioId: '', turmaId: '', observacoes: '' })
      carregar()
      setCertSelecionado(data)
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Erro ao emitir')
    } finally { setSalvando(false) }
  }

  const certificadosFiltrados = certificados.filter(c =>
    c.beneficiario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.numeroRegistro.includes(busca) ||
    c.turma.curso.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const handleImprimir = (cert) => {
    setCertSelecionado(cert)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar certificado..." className="input pl-9 w-64" />
        </div>
        <button onClick={() => setModalAberto(true)} className="btn-primary"><Plus className="w-4 h-4" /> Emitir Certificado</button>
      </div>

      {/* Preview do certificado */}
      {certSelecionado && (
        <div id="certificado-print" className="card border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-3xl font-extrabold text-violet-800 mb-2">CERTIFICADO DE CONCLUSÃO</h2>
            <div className="w-24 h-1 bg-violet-400 mx-auto mb-6 rounded-full" />
            <p className="text-slate-600 text-lg mb-2">Certificamos que</p>
            <p className="text-2xl font-bold text-slate-800 mb-4">{certSelecionado.beneficiario?.nome}</p>
            <p className="text-slate-600 mb-2">concluiu com êxito o curso de</p>
            <p className="text-xl font-bold text-violet-700 mb-4">
              {certSelecionado.turma?.curso?.icone} {certSelecionado.turma?.curso?.nome}
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Carga horária: {certSelecionado.turma?.curso?.cargaHoraria} horas &nbsp;|&nbsp; Turma: {certSelecionado.turma?.nome}
            </p>
            <div className="flex justify-center gap-16 my-8">
              <div className="text-center">
                <div className="w-32 border-t-2 border-slate-400 pt-2">
                  <p className="text-sm font-semibold text-slate-600">Coordenação Pedagógica</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-32 border-t-2 border-slate-400 pt-2">
                  <p className="text-sm font-semibold text-slate-600">Projeto POT</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Nº {certSelecionado.numeroRegistro} &nbsp;·&nbsp;
              Emitido em {certSelecionado.dataEmissao ? format(new Date(certSelecionado.dataEmissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
            </p>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-violet-200">
            <button onClick={() => setCertSelecionado(null)} className="btn-secondary">Fechar</button>
            <button onClick={() => window.print()} className="btn-primary"><Printer className="w-4 h-4" /> Imprimir</button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nº Registro</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Beneficiário</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Curso</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Turma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Emitido em</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {certificadosFiltrados.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <Award className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-400">Nenhum certificado encontrado</p>
                </td></tr>
              ) : certificadosFiltrados.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-violet-50/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-violet-700 font-semibold">{c.numeroRegistro}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.beneficiario.nome}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: c.turma.curso.cor + '22', color: c.turma.curso.cor }}>
                      {c.turma.curso.icone} {c.turma.curso.nome}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.turma.nome}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {format(new Date(c.dataEmissao), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleImprimir(c)} className="p-1.5 hover:bg-violet-100 text-violet-600 rounded-lg transition-colors" title="Visualizar">
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal emitir */}
      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title="Emitir Novo Certificado">
        <form onSubmit={emitir} className="p-6 space-y-4">
          <div>
            <label className="label">Beneficiário *</label>
            <select value={form.beneficiarioId} onChange={(e) => setForm(p => ({ ...p, beneficiarioId: e.target.value }))} className="input" required>
              <option value="">Selecione o beneficiário...</option>
              {beneficiarios.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Turma *</label>
            <select value={form.turmaId} onChange={(e) => setForm(p => ({ ...p, turmaId: e.target.value }))} className="input" required>
              <option value="">Selecione a turma...</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.curso.icone} {t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea value={form.observacoes} onChange={(e) => setForm(p => ({ ...p, observacoes: e.target.value }))} className="input" rows={2} placeholder="Observações opcionais..." />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-60">
              <Award className="w-4 h-4" /> {salvando ? 'Emitindo...' : 'Emitir Certificado'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
