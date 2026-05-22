import { useState } from 'react'
import { CheckCircle, Circle, AlertTriangle, Plus, X } from 'lucide-react'

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

function diasAte(dateStr) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dateStr)
  return Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24))
}

export default function Faturas({ faturas, parcelas, onToggleFatura, onAddFatura, onToggleParcela }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ mes_referencia: '', vencimento: '', valor_total: '', valor_terceiros: '' })
  const [loading, setLoading] = useState(false)

  const totalPendente = faturas.filter(f => !f.paga).reduce((s, f) => s + Number(f.valor_total), 0)
  const totalTerceiros = parcelas.reduce((s, p) => s + Number(p.valor_parcela), 0)

  const devedores = [...new Set(parcelas.map(p => p.nome_devedor))]

  async function handleAdd(e) {
    e.preventDefault()
    setLoading(true)
    await onAddFatura({
      mes_referencia: form.mes_referencia,
      vencimento: form.vencimento,
      valor_total: Number(form.valor_total),
      valor_terceiros: Number(form.valor_terceiros) || 0,
    })
    setShowModal(false)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Faturas</h1>
          <p className="text-slate-400 text-sm mt-1">{fmt(totalPendente)} pendente · {fmt(totalTerceiros)} de terceiros/mês</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#534AB7] hover:bg-[#4340a0] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nova fatura
        </button>
      </div>

      {/* Faturas */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-white font-semibold">Faturas do Cartão</h2>
        </div>
        <div className="divide-y divide-slate-700/30">
          {faturas.length === 0 && (
            <p className="text-slate-500 text-sm p-6 text-center">Nenhuma fatura cadastrada</p>
          )}
          {faturas.map(f => {
            const dias = diasAte(f.vencimento)
            const urgente = dias <= 7 && !f.paga
            return (
              <div key={f.id} className={`flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors ${f.paga ? 'opacity-50' : ''}`}>
                <button onClick={() => onToggleFatura(f.id, !f.paga)} className="shrink-0">
                  {f.paga
                    ? <CheckCircle size={20} className="text-[#0F6E56]" />
                    : <Circle size={20} className="text-slate-500 hover:text-slate-300" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{f.mes_referencia}</p>
                    {urgente && <AlertTriangle size={14} className="text-yellow-400" />}
                  </div>
                  <p className="text-slate-500 text-xs">
                    Vence {new Date(f.vencimento).toLocaleDateString('pt-BR')}
                    {!f.paga && ` · ${dias > 0 ? `em ${dias} dias` : dias === 0 ? 'hoje' : `${Math.abs(dias)} dias atrás`}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">{fmt(f.valor_total)}</p>
                  <p className="text-slate-500 text-xs">
                    Seu: {fmt(f.valor_proprio)} · 3ºs: {fmt(f.valor_terceiros)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Parcelas por devedor */}
      {devedores.map(devedor => {
        const itens = parcelas.filter(p => p.nome_devedor === devedor)
        const total = itens.reduce((s, p) => s + Number(p.valor_parcela), 0)
        return (
          <div key={devedor} className="bg-[#161b27] border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-white font-semibold">Parcelas — {devedor}</h2>
              <span className="text-slate-400 text-sm">{fmt(total)}/mês</span>
            </div>
            <div className="divide-y divide-slate-700/30">
              {itens.map(p => (
                <div key={p.id} className={`flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors ${p.pago ? 'opacity-50' : ''}`}>
                  <button onClick={() => onToggleParcela(p.id, !p.pago)} className="shrink-0">
                    {p.pago
                      ? <CheckCircle size={20} className="text-[#0F6E56]" />
                      : <Circle size={20} className="text-slate-500 hover:text-slate-300" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{p.descricao}</p>
                    <p className="text-slate-500 text-xs">{p.mes_inicio} → {p.mes_fim} · Parcela {p.parcela_atual}/{p.total_parcelas}</p>
                  </div>
                  <p className="text-white font-semibold text-sm">{fmt(p.valor_parcela)}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Nova fatura</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Mês referência</label>
                  <input type="text" value={form.mes_referencia} onChange={e => setForm(p => ({ ...p, mes_referencia: e.target.value }))}
                    placeholder="ex: jun/26"
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#534AB7]" required />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Vencimento</label>
                  <input type="date" value={form.vencimento} onChange={e => setForm(p => ({ ...p, vencimento: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#534AB7]" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Valor total (R$)</label>
                  <input type="number" value={form.valor_total} onChange={e => setForm(p => ({ ...p, valor_total: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#534AB7]" step="0.01" required />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Valor 3ºs (R$)</label>
                  <input type="number" value={form.valor_terceiros} onChange={e => setForm(p => ({ ...p, valor_terceiros: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#534AB7]" step="0.01" placeholder="0,00" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-[#534AB7] text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
                  {loading ? '...' : 'Adicionar'}
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
