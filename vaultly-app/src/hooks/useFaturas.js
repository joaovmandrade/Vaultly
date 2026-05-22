import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFaturas(userId) {
  const [faturas, setFaturas] = useState([])
  const [parcelas, setParcelas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    setLoading(true)
    const [fats, parts] = await Promise.all([
      supabase.from('faturas').select('*').eq('user_id', userId).order('vencimento'),
      supabase.from('parcelas_terceiros').select('*').eq('user_id', userId).order('nome_devedor'),
    ])
    setFaturas(fats.data || [])
    setParcelas(parts.data || [])
    setLoading(false)
  }

  async function toggleFatura(id, paga) {
    const { error } = await supabase.from('faturas').update({ paga }).eq('id', id)
    if (!error) setFaturas(prev => prev.map(f => f.id === id ? { ...f, paga } : f))
    return { error }
  }

  async function addFatura(fatura) {
    const { data, error } = await supabase
      .from('faturas')
      .insert({ user_id: userId, ...fatura })
      .select()
      .single()
    if (!error) setFaturas(prev => [...prev, data].sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento)))
    return { data, error }
  }

  async function toggleParcela(id, pago) {
    const { error } = await supabase.from('parcelas_terceiros').update({ pago }).eq('id', id)
    if (!error) setParcelas(prev => prev.map(p => p.id === id ? { ...p, pago } : p))
    return { error }
  }

  return { faturas, parcelas, loading, toggleFatura, addFatura, toggleParcela, refetch: fetchAll }
}
