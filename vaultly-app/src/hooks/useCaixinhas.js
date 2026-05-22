import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCaixinhas(userId) {
  const [caixinhas, setCaixinhas] = useState([])
  const [aportes, setAportes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    setLoading(true)
    const [cxs, aps] = await Promise.all([
      supabase.from('caixinhas').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('aportes_caixinhas').select('*').eq('user_id', userId).order('data', { ascending: false }),
    ])
    setCaixinhas(cxs.data || [])
    setAportes(aps.data || [])
    setLoading(false)
  }

  async function addAporte(caixinhaId, valor, observacao = '') {
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('aportes_caixinhas').insert({
      user_id: userId, caixinha_id: caixinhaId, valor, data: today, observacao,
    })
    if (error) return { error }
    const novoSaldo = (caixinhas.find(c => c.id === caixinhaId)?.saldo_atual || 0) + valor
    const { error: err2 } = await supabase
      .from('caixinhas')
      .update({ saldo_atual: novoSaldo })
      .eq('id', caixinhaId)
    if (!err2) setCaixinhas(prev => prev.map(c => c.id === caixinhaId ? { ...c, saldo_atual: novoSaldo } : c))
    return { error: err2 }
  }

  async function addCaixinha(caixinha) {
    const { data, error } = await supabase
      .from('caixinhas')
      .insert({ user_id: userId, ...caixinha })
      .select()
      .single()
    if (!error) setCaixinhas(prev => [...prev, data])
    return { data, error }
  }

  async function updateCaixinha(id, updates) {
    const { data, error } = await supabase
      .from('caixinhas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setCaixinhas(prev => prev.map(c => c.id === id ? data : c))
    return { data, error }
  }

  async function deleteCaixinha(id) {
    const { error } = await supabase.from('caixinhas').delete().eq('id', id)
    if (!error) setCaixinhas(prev => prev.filter(c => c.id !== id))
    return { error }
  }

  return { caixinhas, aportes, loading, addAporte, addCaixinha, updateCaixinha, deleteCaixinha, refetch: fetchAll }
}
