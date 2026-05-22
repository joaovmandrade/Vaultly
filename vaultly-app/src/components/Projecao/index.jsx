import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts'
import { Target } from 'lucide-react'

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

function fmtK(v) {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`
  return fmt(v)
}

const MARCOS = [
  { mes: 'set/26', label: 'Consórcio encerra (+R$216)', cor: '#854F0B' },
  { mes: 'mar/27', label: 'Parcelas encerram (+R$263)', cor: '#0F6E56' },
]

export default function Projecao({ perfil, gastosFixos, historico }) {
  const reservaAtual = Number(perfil?.reserva_atual || 0)
  const meta = Number(perfil?.meta_100k || 100000)
  const [poupancaMensal, setPoupancaMensal] = useState(500)

  function gerarProjecao() {
    const dados = []
    let acumulado = reservaAtual
    const hoje = new Date()
    let mes = hoje.getMonth()
    let ano = hoje.getFullYear()

    for (let i = 0; i <= 60; i++) {
      const nomeMes = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('. ', '/')
      dados.push({ mes: nomeMes, acumulado: Math.round(acumulado), meta })

      let aporte = poupancaMensal
      const key = `${['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][mes]}/${String(ano).slice(2)}`
      if (key === 'set/26') aporte += 216
      if (key === 'mar/27') aporte += 263

      acumulado += aporte
      mes++
      if (mes > 11) { mes = 0; ano++ }
    }
    return dados
  }

  const dados = gerarProjecao()
  const metaAtingida = dados.find(d => d.acumulado >= meta)
  const mesesParaMeta = metaAtingida ? dados.indexOf(metaAtingida) : null

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-[#1e2130] border border-slate-700 rounded-lg p-3 text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-[#0F6E56] font-semibold">Acumulado: {fmt(payload[0]?.value)}</p>
        <p className="text-slate-400">Meta: {fmt(meta)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Projeção 100k</h1>
        <p className="text-slate-400 text-sm mt-1">Simulação do seu caminho até a meta</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs mb-2">Reserva atual</p>
          <p className="text-white text-xl font-bold">{fmt(reservaAtual)}</p>
        </div>
        <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs mb-2">Meta</p>
          <p className="text-white text-xl font-bold">{fmt(meta)}</p>
        </div>
        <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs mb-2">Chegada estimada</p>
          <p className={`text-xl font-bold ${metaAtingida ? 'text-[#0F6E56]' : 'text-slate-400'}`}>
            {metaAtingida ? metaAtingida.mes : 'Aumentar aporte'}
          </p>
          {mesesParaMeta && <p className="text-slate-500 text-xs mt-1">{mesesParaMeta} meses</p>}
        </div>
      </div>

      {/* Slider */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-white font-medium text-sm">Poupança mensal</label>
          <span className="text-[#0F6E56] font-bold text-lg">{fmt(poupancaMensal)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={3000}
          step={50}
          value={poupancaMensal}
          onChange={e => setPoupancaMensal(Number(e.target.value))}
          className="w-full accent-[#0F6E56]"
        />
        <div className="flex justify-between text-slate-500 text-xs mt-1">
          <span>R$ 0</span>
          <span>R$ 1.500</span>
          <span>R$ 3.000</span>
        </div>
      </div>

      {/* Marcos */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Marcos importantes</h2>
        <div className="space-y-2">
          {MARCOS.map(m => (
            <div key={m.mes} className="flex items-center gap-3 bg-[#1e2130] rounded-lg px-3 py-2.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.cor }} />
              <span className="text-slate-400 text-sm font-medium w-16">{m.mes}</span>
              <span className="text-white text-sm">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Projeção acumulado vs meta</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dados} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
            <XAxis dataKey="mes" stroke="#475569" tick={{ fontSize: 11 }} interval={5} />
            <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={fmtK} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={meta} stroke="#534AB7" strokeDasharray="5 5" label={{ value: '100k', fill: '#534AB7', fontSize: 12 }} />
            <Line type="monotone" dataKey="acumulado" stroke="#0F6E56" strokeWidth={2.5} dot={false} name="Acumulado" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
