import { TrendingUp, PiggyBank, CreditCard, Target } from 'lucide-react'

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

export default function MetricCards({ perfil, gastosFixos, faturas }) {
  const totalFixos = gastosFixos.reduce((s, g) => s + Number(g.valor), 0)
  const renda = Number(perfil?.renda_disponivel || 0)
  const sobra = renda - totalFixos
  const proximaFatura = faturas
    ?.filter(f => !f.paga && new Date(f.vencimento) >= new Date())
    .sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))[0]

  const cards = [
    {
      label: 'Renda disponível',
      value: fmt(renda),
      icon: TrendingUp,
      color: '#0F6E56',
      sub: `Salário - MEI - 13º`,
    },
    {
      label: 'Gastos fixos',
      value: fmt(totalFixos),
      icon: CreditCard,
      color: '#534AB7',
      sub: `${gastosFixos.length} compromissos`,
    },
    {
      label: 'Sobra mensal',
      value: fmt(sobra),
      icon: PiggyBank,
      color: sobra >= 0 ? '#0F6E56' : '#A32D2D',
      sub: `Após fixos`,
    },
    {
      label: 'Próxima fatura',
      value: proximaFatura ? fmt(proximaFatura.valor_total) : '—',
      icon: Target,
      color: '#854F0B',
      sub: proximaFatura ? `Vence ${new Date(proximaFatura.vencimento).toLocaleDateString('pt-BR')}` : 'Nenhuma pendente',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-[#161b27] border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{card.label}</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '22' }}>
              <card.icon size={16} style={{ color: card.color }} />
            </div>
          </div>
          <p className="text-white text-xl font-bold mb-1">{card.value}</p>
          <p className="text-slate-500 text-xs">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
