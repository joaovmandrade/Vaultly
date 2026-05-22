import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

const CATS = {
  transporte: { label: 'Transporte', color: '#185FA5' },
  moradia: { label: 'Moradia', color: '#534AB7' },
  saude: { label: 'Saúde', color: '#0F6E56' },
  obrigacoes: { label: 'Obrigações', color: '#854F0B' },
  poupanca: { label: 'Poupança', color: '#A32D2D' },
}

export default function Orcamento({ perfil, gastosFixos, categoriasVariaveis }) {
  const renda = Number(perfil?.renda_disponivel || 0)
  const totalFixos = gastosFixos.reduce((s, g) => s + Number(g.valor), 0)

  const [variaveis, setVariaveis] = useState({})

  useEffect(() => {
    const init = {}
    categoriasVariaveis.forEach(c => { init[c.id] = Number(c.limite_mensal) || 0 })
    setVariaveis(init)
  }, [categoriasVariaveis])

  const totalVariaveis = Object.values(variaveis).reduce((s, v) => s + v, 0)
  const sobra = renda - totalFixos - totalVariaveis
  const pct = renda > 0 ? ((totalFixos + totalVariaveis) / renda) * 100 : 0

  const grupoFixos = gastosFixos.reduce((acc, g) => {
    const cat = g.categoria || 'outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(g)
    return acc
  }, {})

  let alertColor = 'text-[#0F6E56]'
  let AlertIcon = CheckCircle
  let alertMsg = 'Orçamento saudável'
  if (pct > 90) { alertColor = 'text-red-400'; AlertIcon = AlertCircle; alertMsg = 'Atenção: quase sem margem!' }
  else if (pct > 75) { alertColor = 'text-yellow-400'; AlertIcon = AlertTriangle; alertMsg = 'Orçamento apertado' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Orçamento</h1>
        <p className="text-slate-400 text-sm mt-1">Planejamento do mês</p>
      </div>

      {/* Status */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-2 ${alertColor}`}>
            <AlertIcon size={18} />
            <span className="font-medium text-sm">{alertMsg}</span>
          </div>
          <span className="text-slate-400 text-sm">{pct.toFixed(0)}% comprometido</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct > 90 ? '#A32D2D' : pct > 75 ? '#854F0B' : '#0F6E56' }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-xs mb-1">Renda</p>
            <p className="text-white font-semibold">{fmt(renda)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Gastos</p>
            <p className="text-white font-semibold">{fmt(totalFixos + totalVariaveis)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Sobra</p>
            <p className={`font-semibold ${sobra >= 0 ? 'text-[#0F6E56]' : 'text-red-400'}`}>{fmt(sobra)}</p>
          </div>
        </div>
      </div>

      {/* Fixos */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Gastos Fixos</h2>
          <span className="text-slate-400 text-sm">{fmt(totalFixos)}</span>
        </div>
        <div className="space-y-4">
          {Object.entries(grupoFixos).map(([cat, items]) => {
            const catInfo = CATS[cat] || { label: cat, color: '#888780' }
            const total = items.reduce((s, g) => s + Number(g.valor), 0)
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: catInfo.color }}>{catInfo.label}</span>
                  <span className="text-slate-400 text-xs">{fmt(total)}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map(g => (
                    <div key={g.id} className="flex items-center justify-between bg-[#1e2130] rounded-lg px-3 py-2">
                      <div>
                        <p className="text-white text-sm">{g.nome}</p>
                        {g.observacao && <p className="text-slate-500 text-xs">{g.observacao}</p>}
                      </div>
                      <span className="text-slate-300 text-sm font-medium">{fmt(g.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Variáveis */}
      {categoriasVariaveis.length > 0 && (
        <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Gastos Variáveis</h2>
            <span className="text-slate-400 text-sm">{fmt(totalVariaveis)}</span>
          </div>
          <div className="space-y-5">
            {categoriasVariaveis.map(cat => {
              const val = variaveis[cat.id] || 0
              const limite = Number(cat.limite_mensal) || 600
              const pctCat = limite > 0 ? (val / limite) * 100 : 0
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">{cat.nome}</span>
                    <span className="text-slate-400 text-xs">{fmt(val)} / {fmt(limite)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={limite}
                    step={10}
                    value={val}
                    onChange={e => setVariaveis(prev => ({ ...prev, [cat.id]: Number(e.target.value) }))}
                    className="w-full accent-[#534AB7] mb-1"
                  />
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(pctCat, 100)}%`, backgroundColor: cat.cor || '#534AB7' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
