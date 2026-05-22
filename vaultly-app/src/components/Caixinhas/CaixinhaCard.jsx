import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

export default function CaixinhaCard({ caixinha, onAporte, onEdit, onDelete }) {
  const [showAporte, setShowAporte] = useState(false)
  const [valor, setValor] = useState('')
  const [obs, setObs] = useState('')
  const [loading, setLoading] = useState(false)

  const saldo = Number(caixinha.saldo_atual)
  const meta = Number(caixinha.meta)
  const pct = meta > 0 ? Math.min((saldo / meta) * 100, 100) : 0

  const mesesRestantes = caixinha.prazo_meses
    ? `${caixinha.prazo_meses} meses`
    : null

  async function handleAporte(e) {
    e.preventDefault()
    if (!valor || isNaN(Number(valor))) return
    setLoading(true)
    await onAporte(caixinha.id, Number(valor), obs)
    setValor('')
    setObs('')
    setShowAporte(false)
    setLoading(false)
  }

  return (
    <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: (caixinha.cor || '#0F6E56') + '22' }}>
            {caixinha.icone === 'shield' ? '🛡️' :
             caixinha.icone === 'heart' ? '💍' :
             caixinha.icone === 'home' ? '🏠' :
             caixinha.icone === 'calendar' ? '📅' : '💰'}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{caixinha.nome}</h3>
            {mesesRestantes && <p className="text-slate-500 text-xs">{mesesRestantes}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(caixinha.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-white font-bold text-lg">{fmt(saldo)}</span>
          {meta > 0 && <span className="text-slate-400">{fmt(meta)}</span>}
        </div>
        {meta > 0 && (
          <>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: caixinha.cor || '#0F6E56' }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-1">{pct.toFixed(1)}% da meta</p>
          </>
        )}
      </div>

      {caixinha.aporte_mensal > 0 && (
        <p className="text-slate-400 text-xs mb-3">Aporte mensal: {fmt(caixinha.aporte_mensal)}</p>
      )}

      {!showAporte ? (
        <button
          onClick={() => setShowAporte(true)}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200 transition-colors"
        >
          <Plus size={14} /> Registrar aporte
        </button>
      ) : (
        <form onSubmit={handleAporte} className="space-y-2">
          <input
            type="number"
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder="Valor (R$)"
            step="0.01"
            min="0.01"
            className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#0F6E56]"
            autoFocus
          />
          <input
            type="text"
            value={obs}
            onChange={e => setObs(e.target.value)}
            placeholder="Observação (opcional)"
            className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#0F6E56]"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#0F6E56] text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50">
              {loading ? '...' : 'Confirmar'}
            </button>
            <button type="button" onClick={() => setShowAporte(false)}
              className="flex-1 bg-slate-700 text-white text-sm font-medium py-2 rounded-lg">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
