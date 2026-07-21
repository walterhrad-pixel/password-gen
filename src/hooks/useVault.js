import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import { encryptJSON, decryptJSON } from '../utils/vaultCrypto'

export function useVault(user, vaultKey) {
  const [entries, setEntries] = useState([])
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!user || !vaultKey) { setEntries([]); return }
    loadEntries()
  }, [user, vaultKey])

  async function loadEntries() {
    setLoadError(null)
    const { data, error } = await supabase
      .from('passwords')
      .select('id, ciphertext, iv, created_at')
      .order('created_at', { ascending: false })

    if (error) { setLoadError('Could not load vault entries.'); return }

    const decrypted = []
    for (const row of data ?? []) {
      try {
        const { password, label } = await decryptJSON(vaultKey, row.ciphertext, row.iv)
        decrypted.push({ id: row.id, password, label, created_at: row.created_at })
      } catch {
        setLoadError('Some entries could not be decrypted.')
      }
    }
    setEntries(decrypted)
  }

  async function savePassword(password, label) {
    if (!user || !vaultKey || !password) return
    setSaving(true)
    setSaveError(null)
    const { ciphertext, iv } = await encryptJSON(vaultKey, { password, label: label.trim() })
    const { error } = await supabase.from('passwords').insert({
      user_id: user.id,
      ciphertext,
      iv,
    })
    if (error) {
      console.error('Vault save failed:', error)
      setSaveError(error.message || 'Could not save this password.')
    } else {
      await loadEntries()
    }
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

  return { entries, saving, loadError, saveError, savePassword, deleteEntry, clearAll }
}
