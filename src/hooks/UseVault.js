// src/hooks/useVault.js
import { useState, useEffect } from 'react'
import { supabase } from '../superbase/client'

export function useVault(user) {
  const [entries, setEntries] = useState([])
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!user) { setEntries([]); return }
    loadEntries()
  }, [user])

  async function loadEntries() {
    const { data } = await supabase
      .from('passwords')
      .select('*')
      .order('created_at', { ascending: false })
    setEntries(data ?? [])
  }

  async function savePassword(password, label) {
    if (!user || !password) return
    setSaving(true)
    await supabase.from('passwords').insert({
      user_id:  user.id,
      password,
      label:    label.trim(),
    })
    await loadEntries()
    setSaving(false)
  }

  async function deleteEntry(id) {
    await supabase.from('passwords').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function clearAll() {
    await supabase.from('passwords').delete().eq('user_id', user.id)
    setEntries([])
  }

  return { entries, saving, savePassword, deleteEntry, clearAll }
}
