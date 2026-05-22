import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro('Email ou senha incorretos.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0F6E56] flex items-center justify-center text-xl">🔒</div>
            <span className="text-2xl font-bold text-white">Vaultly</span>
          </div>
          <p className="text-slate-400 text-sm">Seu cofre financeiro pessoal</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#161b27] border border-slate-700/50 rounded-2xl p-8 space-y-5">
          <h2 className="text-white text-xl font-semibold mb-6">Entrar na conta</h2>

          <div className="space-y-1">
            <label className="text-slate-400 text-sm">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#0F6E56] transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-sm">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="w-full bg-[#1e2130] border border-slate-700 rounded-lg pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#0F6E56] transition-colors"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F6E56] hover:bg-[#0a5542] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-slate-400 text-sm">
            Não tem conta?{' '}
            <button type="button" onClick={onSwitch} className="text-[#0F6E56] hover:text-[#14a07d] transition-colors">
              Criar conta
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
