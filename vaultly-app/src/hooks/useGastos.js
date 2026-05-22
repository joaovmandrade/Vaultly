import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useGastos(userId) {
  const [gastosFixos, setGastosFixos] = useState([])
  const [categoriasVariaveis, setCategoriasVariaveis] = useState([])
  const [gastosVariaveis, setGastosVariaveis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    setLoading(true)
    const [fixos, cats, variaveis] = await Promise.all([
      supabase.from('gastos_fixos').select('*').eq('user_id', userId).eq('ativo', true).order('valor', { ascending: false }),
      supabase.from('categorias_variaveis').select('*').eq('user_id', userId),
      supabase.from('gastos_variaveis').select('*, categorias_variaveis(nome, cor)').eq('user_id', userId).order('data', { ascending: false }),
    ])
    setGastosFixos(fixos.data || [])
    setCategoriasVariaveis(cats.data || [])
    setGastosVariaveis(variaveis.data || [])
    setLoading(false)
  }

  async function addGastoVariavel(gasto) {
    const { data, error } = await supabase
      .from('gastos_variaveis')
      .insert({ user_id: userId, ...gasto })
      .select('*, categorias_variaveis(nome, cor)')
      .single()
    if (!error) setGastosVariaveis(prev => [data, ...prev])
    return { data, error }
  }

  async function deleteGastoVariavel(id) {
    const { error } = await supabase.from('gastos_variaveis').delete().eq('id', id)
    if (!error) setGastosVariaveis(prev => prev.filter(g => g.id !== id))
    return { error }
  }

  async function addGastoFixo(gasto) {
    const { data, error } = await supabase
      .from('gastos_fixos')
      .insert({ user_id: userId, ...gasto })
      .select()
      .single()
    if (!error) setGastosFixos(prev => [...prev, data])
    return { data, error }
  }

  async function updateGastoFixo(id, updates) {
    const { data, error } = await supabase
      .from('gastos_fixos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setGastosFixos(prev => prev.map(g => g.id === id ? data : g))
    return { data, error }
  }

  async function deleteGastoFixo(id) {
    const { error } = await supabase.from('gastos_fixos').update({ ativo: false }).eq('id', id)
    if (!error) setGastosFixos(prev => prev.filter(g => g.id !== id))
    return { error }
  }

  async function addCategoria(cat) {
    const { data, error } = await supabase
      .from('categorias_variaveis')
      .insert({ user_id: userId, ...cat })
      .select()
      .single()
    if (!error) setCategoriasVariaveis(prev => [...prev, data])
    return { data, error }
  }

  async function updateCategoria(id, updates) {
    const { data, error } = await supabase
      .from('categorias_variaveis')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setCategoriasVariaveis(prev => prev.map(c => c.id === id ? data : c))
    return { data, error }
  }

  async function deleteCategoria(id) {
    const { error } = await supabase.from('categorias_variaveis').delete().eq('id', id)
    if (!error) setCategoriasVariaveis(prev => prev.filter(c => c.id !== id))
    return { error }
  }

  return {
    gastosFixos, categoriasVariaveis, gastosVariaveis, loading,
    addGastoVariavel, deleteGastoVariavel,
    addGastoFixo, updateGastoFixo, deleteGastoFixo,
    addCategoria, updateCategoria, deleteCategoria,
    refetch: fetchAll,
  }
}
