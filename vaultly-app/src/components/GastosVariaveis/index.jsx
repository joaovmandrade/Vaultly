import { useState, useMemo } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

export default function GastosVariaveis({ categoriasVariaveis, gastosVariaveis, onAdd, onDelete }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ categoria_id: '', descricao: '', valor: '', data: new Date().toISOString().split('T')[0] })
  const [loading, setLoading] = useState(false)
  const [mesFiltro, setMesFiltro] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const gastosMes = useMemo(() => {
    return gastosVariaveis.filter(g => g.data?.startsWith(mesFiltro))
  }, [gastosVariaveis, mesFiltro])

  const totalMes = gastosMes.reduce((s, g) => s + Number(g.valor), 0)

  const porCategoria = useMemo(() => {
    const map = {}
    categoriasVariaveis.forEach(c => { map[c.id] = { cat: c, gastos: [], total: 0 } })
    gastosMes.forEach(g => {
      if (g.categoria_id && map[g.categoria_id]) {
        map[g.categoria_id].gastos.push(g)
        map[g.categoria_id].total += Number(g.valor)
      }
    })
    return Object.values(map)
  }, [categoriasVariaveis, gastosMes])

  async function handleAdd(e) {
    e.preventDefault()
    setLoading(true)
    await onAdd({
      categoria_id: form.categoria_id || null,
      descricao: form.descricao,
      valor: Number(form.valor),
      data: form.data,
    })
    setForm(p => ({ ...p, descricao: '', valor: '' }))
    setShowModal(false)
    setLoading(false)
  }

  const [mesSel] = mesFiltro.split('-')
  const mesLabel = new Date(mesFiltro + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Gastos Variáveis</h1>
          <p className="text-slate-400 text-sm mt-1 capitalize">{mesLabel} · {fmt(totalMes)} gasto</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#185FA5] hover:bg-[#1252a0] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Registrar
        </button>
      </div>

      {/* Filtro de mês */}
      <div className="flex items-center gap-3">
        <label className="text-slate-400 text-sm">Mês:</label>
        <input
          type="month"
          value={mesFiltro}
          onChange={e => setMesFiltro(e.target.value)}
          className="bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#185FA5]"
        />
      </div>

      {/* Por categoria */}
      <div className="space-y-4">
        {porCategoria.map(({ cat, gastos, total }) => {
          const limite = Number(cat.limite_mensal) || 0
          const pct = limite > 0 ? Math.min((total / limite) * 100, 100) : 0
          const overBudget = limite > 0 && total > limite
          return (
            <div key={cat.id} className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{cat.nome}</span>
                <span className={`text-sm font-semibold ${overBudget ? 'text-red-400' : 'text-slate-300'}`}>
                  {fmt(total)}{limite > 0 ? ` / ${fmt(limite)}` : ''}
                </span>
              </div>
              {limite > 0 && (
                <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: overBudget ? '#A32D2D' : cat.cor || '#185FA5' }}
                  />
                </div>
              )}
              {gastos.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {gastos.map(g => (
                    <div key={g.id} className="flex items-center gap-3 bg-[#1e2130] rounded-lg px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{g.descricao}</p>
                        <p className="text-slate-500 text-xs">{new Date(g.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className="text-slate-300 text-sm font-medium shrink-0">{fmt(g.valor)}</span>
                      <button onClick={() => onDelete(g.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {gastos.length === 0 && (
                <p className="text-slate-600 text-xs">Nenhum gasto neste mês</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Registrar gasto</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Categoria</label>
                <select value={form.categoria_id} onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))}
                  className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#185FA5]">
                  <option value="">Sem categoria</option>
                  {categoriasVariaveis.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm">Descrição</label>
                <input type="text" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#185FA5]"
                  placeholder="Ex: Jantar restaurante" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Valor (R$)</label>
                  <input type="number" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#185FA5]"
                    step="0.01" min="0.01" required />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Data</label>
                  <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#185FA5]" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-[#185FA5] text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
                  {loading ? '...' : 'Registrar'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 text-white font-medium py-2.5 rounded-lg">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
