import { useState } from 'react'
import CaixinhaCard from './CaixinhaCard'
import { Plus, X } from 'lucide-react'

const CORES = ['#0F6E56', '#534AB7', '#185FA5', '#854F0B', '#A32D2D', '#888780']
const ICONES = ['shield', 'heart', 'home', 'calendar', 'piggy', 'star']

export default function Caixinhas({ caixinhas, onAporte, onAdd, onEdit, onDelete }) {
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ nome: '', meta: '', saldo_atual: '', aporte_mensal: '', cor: '#0F6E56', icone: 'shield', prazo_meses: '' })
  const [loading, setLoading] = useState(false)

  const totalPoupado = caixinhas.reduce((s, c) => s + Number(c.saldo_atual), 0)
  const totalMeta = caixinhas.reduce((s, c) => s + Number(c.meta || 0), 0)

  function openAdd() {
    setEditItem(null)
    setForm({ nome: '', meta: '', saldo_atual: '', aporte_mensal: '', cor: '#0F6E56', icone: 'shield', prazo_meses: '' })
    setShowModal(true)
  }

  function openEdit(cx) {
    setEditItem(cx)
    setForm({
      nome: cx.nome,
      meta: cx.meta || '',
      saldo_atual: cx.saldo_atual || '',
      aporte_mensal: cx.aporte_mensal || '',
      cor: cx.cor || '#0F6E56',
      icone: cx.icone || 'shield',
      prazo_meses: cx.prazo_meses || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      nome: form.nome,
      meta: form.meta ? Number(form.meta) : null,
      saldo_atual: Number(form.saldo_atual) || 0,
      aporte_mensal: Number(form.aporte_mensal) || 0,
      cor: form.cor,
      icone: form.icone,
      prazo_meses: form.prazo_meses ? Number(form.prazo_meses) : null,
    }
    if (editItem) {
      await onEdit(editItem.id, payload)
    } else {
      await onAdd(payload)
    }
    setShowModal(false)
    setLoading(false)
  }

  function fmt(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Caixinhas</h1>
          <p className="text-slate-400 text-sm mt-1">
            {fmt(totalPoupado)} poupados {totalMeta > 0 ? `de ${fmt(totalMeta)}` : ''}
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#0F6E56] hover:bg-[#0a5542] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nova caixinha
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {caixinhas.map(cx => (
          <CaixinhaCard
            key={cx.id}
            caixinha={cx}
            onAporte={onAporte}
            onEdit={() => openEdit(cx)}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">{editItem ? 'Editar caixinha' : 'Nova caixinha'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Nome</label>
                <input type="text" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Meta (R$)</label>
                  <input type="number" value={form.meta} onChange={e => setForm(p => ({ ...p, meta: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" placeholder="Opcional" step="0.01" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Saldo atual (R$)</label>
                  <input type="number" value={form.saldo_atual} onChange={e => setForm(p => ({ ...p, saldo_atual: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" placeholder="0,00" step="0.01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Aporte mensal (R$)</label>
                  <input type="number" value={form.aporte_mensal} onChange={e => setForm(p => ({ ...p, aporte_mensal: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" placeholder="0,00" step="0.01" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Prazo (meses)</label>
                  <input type="number" value={form.prazo_meses} onChange={e => setForm(p => ({ ...p, prazo_meses: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" placeholder="Opcional" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">Cor</label>
                <div className="flex gap-2 mt-2">
                  {CORES.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, cor: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: form.cor === c ? 'white' : 'transparent' }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#0F6E56] text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
                  {loading ? '...' : editItem ? 'Salvar' : 'Criar'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-700 text-white font-medium py-2.5 rounded-lg">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
