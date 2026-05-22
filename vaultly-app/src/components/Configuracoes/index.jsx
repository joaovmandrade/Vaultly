import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Edit2, Save, X, AlertTriangle } from 'lucide-react'

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

const CATEGORIAS_FIXOS = ['transporte', 'moradia', 'saude', 'obrigacoes', 'poupanca', 'lazer', 'outros']

export default function Configuracoes({ perfil, gastosFixos, categoriasVariaveis, onUpdatePerfil, onAddGastoFixo, onUpdateGastoFixo, onDeleteGastoFixo, onAddCategoria, onUpdateCategoria, onDeleteCategoria }) {
  const [tab, setTab] = useState('perfil')
  const [perfilForm, setPerfilForm] = useState({
    nome: perfil?.nome || '',
    salario_liquido: perfil?.salario_liquido || '',
    desconto_mei: perfil?.desconto_mei || '',
    reserva_decimo_terceiro: perfil?.reserva_decimo_terceiro || '',
    dia_pagamento: perfil?.dia_pagamento || 10,
    reserva_atual: perfil?.reserva_atual || '',
    meta_100k: perfil?.meta_100k || 100000,
  })
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [perfilSaved, setPerfilSaved] = useState(false)

  const [novaSenha, setNovaSenha] = useState('')
  const [savingSenha, setSavingSenha] = useState(false)
  const [senhaMsg, setSenhaMsg] = useState('')

  const [showFixoModal, setShowFixoModal] = useState(false)
  const [editFixo, setEditFixo] = useState(null)
  const [fixoForm, setFixoForm] = useState({ nome: '', valor: '', categoria: 'outros', observacao: '' })

  const [showCatModal, setShowCatModal] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [catForm, setCatForm] = useState({ nome: '', limite_mensal: '', cor: '#0F6E56' })

  async function handleSavePerfil(e) {
    e.preventDefault()
    setSavingPerfil(true)
    await onUpdatePerfil({
      nome: perfilForm.nome,
      salario_liquido: Number(perfilForm.salario_liquido) || 0,
      desconto_mei: Number(perfilForm.desconto_mei) || 0,
      reserva_decimo_terceiro: Number(perfilForm.reserva_decimo_terceiro) || 0,
      dia_pagamento: Number(perfilForm.dia_pagamento) || 10,
      reserva_atual: Number(perfilForm.reserva_atual) || 0,
      meta_100k: Number(perfilForm.meta_100k) || 100000,
    })
    setPerfilSaved(true)
    setTimeout(() => setPerfilSaved(false), 2000)
    setSavingPerfil(false)
  }

  async function handleSaveSenha(e) {
    e.preventDefault()
    if (novaSenha.length < 6) { setSenhaMsg('Mínimo 6 caracteres'); return }
    setSavingSenha(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSenhaMsg(error ? 'Erro ao trocar senha.' : 'Senha atualizada!')
    setNovaSenha('')
    setSavingSenha(false)
    setTimeout(() => setSenhaMsg(''), 3000)
  }

  function openAddFixo() {
    setEditFixo(null)
    setFixoForm({ nome: '', valor: '', categoria: 'outros', observacao: '' })
    setShowFixoModal(true)
  }

  function openEditFixo(g) {
    setEditFixo(g)
    setFixoForm({ nome: g.nome, valor: g.valor, categoria: g.categoria, observacao: g.observacao || '' })
    setShowFixoModal(true)
  }

  async function handleFixoSubmit(e) {
    e.preventDefault()
    const payload = { nome: fixoForm.nome, valor: Number(fixoForm.valor), categoria: fixoForm.categoria, observacao: fixoForm.observacao }
    if (editFixo) await onUpdateGastoFixo(editFixo.id, payload)
    else await onAddGastoFixo(payload)
    setShowFixoModal(false)
  }

  function openAddCat() {
    setEditCat(null)
    setCatForm({ nome: '', limite_mensal: '', cor: '#0F6E56' })
    setShowCatModal(true)
  }

  function openEditCat(c) {
    setEditCat(c)
    setCatForm({ nome: c.nome, limite_mensal: c.limite_mensal, cor: c.cor || '#0F6E56' })
    setShowCatModal(true)
  }

  async function handleCatSubmit(e) {
    e.preventDefault()
    const payload = { nome: catForm.nome, limite_mensal: Number(catForm.limite_mensal) || 0, cor: catForm.cor }
    if (editCat) await onUpdateCategoria(editCat.id, payload)
    else await onAddCategoria(payload)
    setShowCatModal(false)
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'fixos', label: 'Gastos fixos' },
    { id: 'categorias', label: 'Categorias variáveis' },
    { id: 'senha', label: 'Segurança' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Configurações</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie seu perfil e preferências</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-[#0F6E56] text-white' : 'bg-[#161b27] text-slate-400 hover:text-white border border-slate-700/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Perfil */}
      {tab === 'perfil' && (
        <form onSubmit={handleSavePerfil} className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm">Nome</label>
              <input type="text" value={perfilForm.nome} onChange={e => setPerfilForm(p => ({ ...p, nome: e.target.value }))}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">Dia de pagamento</label>
              <input type="number" min={1} max={31} value={perfilForm.dia_pagamento} onChange={e => setPerfilForm(p => ({ ...p, dia_pagamento: e.target.value }))}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">Salário líquido (R$)</label>
              <input type="number" step="0.01" value={perfilForm.salario_liquido} onChange={e => setPerfilForm(p => ({ ...p, salario_liquido: e.target.value }))}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">Desconto MEI (R$)</label>
              <input type="number" step="0.01" value={perfilForm.desconto_mei} onChange={e => setPerfilForm(p => ({ ...p, desconto_mei: e.target.value }))}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">Reserva 13º PJ (R$)</label>
              <input type="number" step="0.01" value={perfilForm.reserva_decimo_terceiro} onChange={e => setPerfilForm(p => ({ ...p, reserva_decimo_terceiro: e.target.value }))}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">Reserva atual (R$)</label>
              <input type="number" step="0.01" value={perfilForm.reserva_atual} onChange={e => setPerfilForm(p => ({ ...p, reserva_atual: e.target.value }))}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">Meta 100k (R$)</label>
              <input type="number" step="0.01" value={perfilForm.meta_100k} onChange={e => setPerfilForm(p => ({ ...p, meta_100k: e.target.value }))}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" />
            </div>
          </div>
          {perfil && (
            <div className="bg-[#1e2130] rounded-lg px-4 py-3">
              <p className="text-slate-400 text-sm">Renda disponível = {fmt(perfil.renda_disponivel)}</p>
            </div>
          )}
          <button type="submit" disabled={savingPerfil}
            className="flex items-center gap-2 bg-[#0F6E56] text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-50">
            <Save size={16} /> {savingPerfil ? 'Salvando...' : perfilSaved ? 'Salvo!' : 'Salvar'}
          </button>
        </form>
      )}

      {/* Gastos fixos */}
      {tab === 'fixos' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openAddFixo} className="flex items-center gap-2 bg-[#0F6E56] text-white text-sm font-medium px-4 py-2 rounded-lg">
              <Plus size={16} /> Adicionar
            </button>
          </div>
          <div className="bg-[#161b27] border border-slate-700/50 rounded-xl divide-y divide-slate-700/30">
            {gastosFixos.map(g => (
              <div key={g.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{g.nome}</p>
                  <p className="text-slate-500 text-xs">{g.categoria}{g.observacao ? ` · ${g.observacao}` : ''}</p>
                </div>
                <p className="text-slate-300 text-sm font-medium">{fmt(g.valor)}</p>
                <div className="flex gap-1">
                  <button onClick={() => openEditFixo(g)} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDeleteGastoFixo(g.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorias */}
      {tab === 'categorias' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openAddCat} className="flex items-center gap-2 bg-[#534AB7] text-white text-sm font-medium px-4 py-2 rounded-lg">
              <Plus size={16} /> Adicionar
            </button>
          </div>
          <div className="bg-[#161b27] border border-slate-700/50 rounded-xl divide-y divide-slate-700/30">
            {categoriasVariaveis.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-4 py-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.cor || '#888780' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{c.nome}</p>
                  <p className="text-slate-500 text-xs">Limite: {fmt(c.limite_mensal)}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditCat(c)} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDeleteCategoria(c.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Senha */}
      {tab === 'senha' && (
        <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-5 bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
            <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-300/80 text-sm">Troque sua senha para manter sua conta segura.</p>
          </div>
          <form onSubmit={handleSaveSenha} className="space-y-4 max-w-sm">
            <div>
              <label className="text-slate-400 text-sm">Nova senha</label>
              <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]"
                placeholder="••••••••" minLength={6} required />
            </div>
            {senhaMsg && <p className={`text-sm ${senhaMsg.includes('Erro') ? 'text-red-400' : 'text-[#0F6E56]'}`}>{senhaMsg}</p>}
            <button type="submit" disabled={savingSenha} className="bg-[#0F6E56] text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-50">
              {savingSenha ? 'Salvando...' : 'Trocar senha'}
            </button>
          </form>
        </div>
      )}

      {/* Modal gasto fixo */}
      {showFixoModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">{editFixo ? 'Editar gasto fixo' : 'Novo gasto fixo'}</h2>
              <button onClick={() => setShowFixoModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleFixoSubmit} className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Nome</label>
                <input type="text" value={fixoForm.nome} onChange={e => setFixoForm(p => ({ ...p, nome: e.target.value }))}
                  className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Valor (R$)</label>
                  <input type="number" step="0.01" value={fixoForm.valor} onChange={e => setFixoForm(p => ({ ...p, valor: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]" required />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Categoria</label>
                  <select value={fixoForm.categoria} onChange={e => setFixoForm(p => ({ ...p, categoria: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]">
                    {CATEGORIAS_FIXOS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">Observação</label>
                <input type="text" value={fixoForm.observacao} onChange={e => setFixoForm(p => ({ ...p, observacao: e.target.value }))}
                  className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#0F6E56]"
                  placeholder="Opcional" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#0F6E56] text-white font-medium py-2.5 rounded-lg">{editFixo ? 'Salvar' : 'Adicionar'}</button>
                <button type="button" onClick={() => setShowFixoModal(false)} className="flex-1 bg-slate-700 text-white font-medium py-2.5 rounded-lg">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal categoria variável */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">{editCat ? 'Editar categoria' : 'Nova categoria'}</h2>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCatSubmit} className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Nome</label>
                <input type="text" value={catForm.nome} onChange={e => setCatForm(p => ({ ...p, nome: e.target.value }))}
                  className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#534AB7]" required />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Limite mensal (R$)</label>
                <input type="number" step="0.01" value={catForm.limite_mensal} onChange={e => setCatForm(p => ({ ...p, limite_mensal: e.target.value }))}
                  className="w-full bg-[#1e2130] border border-slate-700 rounded-lg px-3 py-2.5 text-white mt-1 focus:outline-none focus:border-[#534AB7]" />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Cor</label>
                <input type="color" value={catForm.cor} onChange={e => setCatForm(p => ({ ...p, cor: e.target.value }))}
                  className="w-full h-10 bg-[#1e2130] border border-slate-700 rounded-lg mt-1 cursor-pointer" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#534AB7] text-white font-medium py-2.5 rounded-lg">{editCat ? 'Salvar' : 'Adicionar'}</button>
                <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 bg-slate-700 text-white font-medium py-2.5 rounded-lg">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
