import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePerfil(userId) {
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchPerfil()
  }, [userId])

  async function fetchPerfil() {
    setLoading(true)
    const { data } = await supabase
      .from('perfil')
      .select('*')
      .eq('user_id', userId)
      .single()
    setPerfil(data)
    setLoading(false)
  }

  async function updatePerfil(updates) {
    const { data, error } = await supabase
      .from('perfil')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    if (!error) setPerfil(data)
    return { data, error }
  }

  async function createPerfil(values) {
    const { data, error } = await supabase
      .from('perfil')
      .insert({ user_id: userId, ...values })
      .select()
      .single()
    if (!error) setPerfil(data)
    return { data, error }
  }

  return { perfil, loading, updatePerfil, createPerfil, refetch: fetchPerfil }
}
