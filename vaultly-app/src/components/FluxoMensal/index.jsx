import { useState } from 'react'
import { CheckSquare, Square, Calendar, AlertCircle } from 'lucide-react'

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

export default function FluxoMensal({ perfil, gastosFixos, faturas }) {
  const diaPagamento = perfil?.dia_pagamento || 10

  const vencimentos = [
    { dia: 7, desc: 'Financiamento Caixa', valor: 210, cor: '#534AB7' },
    { dia: 7, desc: 'MEI (mês seguinte)', valor: 86, cor: '#854F0B' },
    { dia: diaPagamento, desc: '💰 Salário cai!', valor: Number(perfil?.salario_liquido || 0), cor: '#0F6E56', destaque: true },
    { dia: 12, desc: 'Cartão laranja', valor: 63, cor: '#185FA5' },
    { dia: 31, desc: 'Fatura Nubank (vence)', valor: null, cor: '#A32D2D' },
  ].sort((a, b) => a.dia - b.dia)

  const checklist = [
    { id: 'c1', desc: 'Conferir salário no app do banco', quando: `Dia ${diaPagamento}` },
    { id: 'c2', desc: 'Separar reserva 13º PJ (R$ 300)', quando: `Dia ${diaPagamento}` },
    { id: 'c3', desc: 'Separar desconto MEI (R$ 86)', quando: `Dia ${diaPagamento}` },
    { id: 'c4', desc: 'Registrar gastos variáveis do mês', quando: 'Ao longo do mês' },
    { id: 'c5', desc: 'Verificar fatura Nubank fecha dia 7', quando: 'Dia 7' },
    { id: 'c6', desc: 'Pagar cartão laranja (vence dia 12)', quando: 'Dia 12' },
    { id: 'c7', desc: 'Pagar fatura Nubank (vence dia 31)', quando: 'Dia 31' },
    { id: 'c8', desc: 'Aportar nas caixinhas', quando: `Após dia ${diaPagamento}` },
  ]

  const [checked, setChecked] = useState({})
  function toggle(id) { setChecked(p => ({ ...p, [id]: !p[id] })) }

  const hoje = new Date().getDate()
  const totalChecked = Object.values(checked).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Fluxo Mensal</h1>
        <p className="text-slate-400 text-sm mt-1">Roteiro do mês, vencimentos e checklist</p>
      </div>

      {/* Calendário */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-[#0F6E56]" /> Calendário de vencimentos
        </h2>
        <div className="space-y-2">
          {vencimentos.map((v, i) => {
            const passado = v.dia < hoje
            return (
              <div key={i}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${v.destaque ? 'border border-[#0F6E56]/40 bg-[#0F6E56]/10' : 'bg-[#1e2130]'} ${passado ? 'opacity-50' : ''}`}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{ backgroundColor: v.cor + '22', color: v.cor }}>
                  {v.dia}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${v.destaque ? 'text-white' : 'text-slate-200'}`}>{v.desc}</p>
                  {passado && <p className="text-slate-500 text-xs">Passou</p>}
                </div>
                {v.valor && (
                  <p className="font-semibold text-sm" style={{ color: v.cor }}>{fmt(v.valor)}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <CheckSquare size={18} className="text-[#534AB7]" /> Checklist do mês
          </h2>
          <span className="text-slate-400 text-sm">{totalChecked}/{checklist.length} feito</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4">
          <div
            className="h-1.5 rounded-full bg-[#534AB7] transition-all"
            style={{ width: `${checklist.length > 0 ? (totalChecked / checklist.length) * 100 : 0}%` }}
          />
        </div>
        <div className="space-y-2">
          {checklist.map(item => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 bg-[#1e2130] hover:bg-slate-700/30 rounded-lg px-4 py-3 transition-colors text-left"
            >
              {checked[item.id]
                ? <CheckSquare size={18} className="text-[#0F6E56] shrink-0" />
                : <Square size={18} className="text-slate-500 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${checked[item.id] ? 'line-through text-slate-500' : 'text-white'}`}>{item.desc}</p>
              </div>
              <span className="text-slate-500 text-xs shrink-0">{item.quando}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerta faturas próximas */}
      {faturas.filter(f => !f.paga && diasAte(f.vencimento) <= 7).length > 0 && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium text-sm">Faturas vencendo em breve</p>
            {faturas.filter(f => !f.paga && diasAte(f.vencimento) <= 7).map(f => (
              <p key={f.id} className="text-yellow-300/80 text-sm mt-1">
                {f.mes_referencia} — {fmt(f.valor_total)} vence {new Date(f.vencimento).toLocaleDateString('pt-BR')}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function diasAte(dateStr) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(dateStr) - hoje) / (1000 * 60 * 60 * 24))
}
