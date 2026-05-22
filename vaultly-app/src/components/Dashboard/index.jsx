import MetricCards from './MetricCards'

export default function Dashboard({ perfil, gastosFixos, faturas }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Olá, {perfil?.nome || 'Visitante'} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Aqui está um resumo do seu mês</p>
      </div>
      <MetricCards perfil={perfil} gastosFixos={gastosFixos} faturas={faturas} />
    </div>
  )
}
