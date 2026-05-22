import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './components/Dashboard'
import Orcamento from './components/Orcamento'
import Caixinhas from './components/Caixinhas'
import Faturas from './components/Faturas'
import Projecao from './components/Projecao'
import FluxoMensal from './components/FluxoMensal'
import GastosVariaveis from './components/GastosVariaveis'
import Configuracoes from './components/Configuracoes'
import { usePerfil } from './hooks/usePerfil'
import { useGastos } from './hooks/useGastos'
import { useCaixinhas } from './hooks/useCaixinhas'
import { useFaturas } from './hooks/useFaturas'
import {
  LayoutDashboard, PieChart, PiggyBank, CreditCard,
  TrendingUp, Calendar, ShoppingBag, Settings, LogOut, Menu, X
} from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orcamento', label: 'Orçamento', icon: PieChart },
  { id: 'caixinhas', label: 'Caixinhas', icon: PiggyBank },
  { id: 'faturas', label: 'Faturas', icon: CreditCard },
  { id: 'projecao', label: 'Projeção 100k', icon: TrendingUp },
  { id: 'fluxo', label: 'Fluxo Mensal', icon: Calendar },
  { id: 'gastos', label: 'Gastos Variáveis', icon: ShoppingBag },
  { id: 'config', label: 'Configurações', icon: Settings },
]

export default function App() {
  const [session, setSession] = useState(undefined)
  const [authView, setAuthView] = useState('login')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  const { perfil, loading: loadingPerfil, updatePerfil } = usePerfil(userId)
  const {
    gastosFixos, categoriasVariaveis, gastosVariaveis, loading: loadingGastos,
    addGastoVariavel, deleteGastoVariavel,
    addGastoFixo, updateGastoFixo, deleteGastoFixo,
    addCategoria, updateCategoria, deleteCategoria,
  } = useGastos(userId)
  const { caixinhas, addAporte, addCaixinha, updateCaixinha, deleteCaixinha } = useCaixinhas(userId)
  const { faturas, parcelas, toggleFatura, addFatura, toggleParcela } = useFaturas(userId)

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return authView === 'login'
      ? <Login onSwitch={() => setAuthView('register')} />
      : <Register onSwitch={() => setAuthView('login')} />
  }

  const loading = loadingPerfil || loadingGastos

  function renderContent() {
    switch (activeTab) {
      case 'dashboard': return <Dashboard perfil={perfil} gastosFixos={gastosFixos} faturas={faturas} />
      case 'orcamento': return <Orcamento perfil={perfil} gastosFixos={gastosFixos} categoriasVariaveis={categoriasVariaveis} />
      case 'caixinhas': return <Caixinhas caixinhas={caixinhas} onAporte={addAporte} onAdd={addCaixinha} onEdit={updateCaixinha} onDelete={deleteCaixinha} />
      case 'faturas': return <Faturas faturas={faturas} parcelas={parcelas} onToggleFatura={toggleFatura} onAddFatura={addFatura} onToggleParcela={toggleParcela} />
      case 'projecao': return <Projecao perfil={perfil} gastosFixos={gastosFixos} historico={[]} />
      case 'fluxo': return <FluxoMensal perfil={perfil} gastosFixos={gastosFixos} faturas={faturas} />
      case 'gastos': return <GastosVariaveis categoriasVariaveis={categoriasVariaveis} gastosVariaveis={gastosVariaveis} onAdd={addGastoVariavel} onDelete={deleteGastoVariavel} />
      case 'config': return (
        <Configuracoes
          perfil={perfil}
          gastosFixos={gastosFixos}
          categoriasVariaveis={categoriasVariaveis}
          onUpdatePerfil={updatePerfil}
          onAddGastoFixo={addGastoFixo}
          onUpdateGastoFixo={updateGastoFixo}
          onDeleteGastoFixo={deleteGastoFixo}
          onAddCategoria={addCategoria}
          onUpdateCategoria={updateCategoria}
          onDeleteCategoria={deleteCategoria}
        />
      )
      default: return null
    }
  }

  const currentNav = NAV.find(n => n.id === activeTab)

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0c1020] border-r border-slate-700/50 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-[#0F6E56] flex items-center justify-center text-base">🔒</div>
          <span className="text-white font-bold text-lg">Vaultly</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-[#0F6E56]/20 text-[#14a07d]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#534AB7]/30 flex items-center justify-center text-sm font-bold text-[#534AB7]">
              {perfil?.nome?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{perfil?.nome || 'Usuário'}</p>
              <p className="text-slate-500 text-xs truncate">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={22} />
          </button>
          <span className="text-white font-semibold">{currentNav?.label}</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
              {renderContent()}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
