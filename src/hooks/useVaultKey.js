import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase/client'
import {
  generateSalt,
  deriveKey,
  createPassphraseCheck,
  verifyPassphraseCheck,
} from '../utils/vaultCrypto'

export function useVaultKey(user) {
  const [vaultKey, setVaultKey] = useState(null)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setVaultKey(null)
    if (!user) { setChecking(false); return }
    checkMeta()
  }, [user])

  async function checkMeta() {
    setChecking(true)
    const { data } = await supabase
      .from('vault_meta')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
    setNeedsSetup(!data)
    setChecking(false)
  }

  const setupPassphrase = useCallback(async (passphrase) => {
    setError(null)
    const salt = generateSalt()
    const key = await deriveKey(passphrase, salt)
    const check = await createPassphraseCheck(key)

    const { error: e } = await supabase.from('vault_meta').insert({
      user_id: user.id,
      salt,
      check_ciphertext: check.ciphertext,
      check_iv: check.iv,
    })
    if (e) { setError('Could not set up vault. Please try again.'); throw e }

    setVaultKey(key)
    setNeedsSetup(false)
  }, [user])

  const unlock = useCallback(async (passphrase) => {
    setError(null)
    const { data, error: e } = await supabase
      .from('vault_meta')
      .select('salt, check_ciphertext, check_iv')
      .eq('user_id', user.id)
      .single()

    if (e || !data) { setError('Could not load vault. Please try again.'); return false }

    const key = await deriveKey(passphrase, data.salt)
    const valid = await verifyPassphraseCheck(key, data.check_ciphertext, data.check_iv)

    if (!valid) { setError('Incorrect vault passphrase.'); return false }

    setVaultKey(key)
    return true
  }, [user])

  const lock = useCallback(() => setVaultKey(null), [])

  return { vaultKey, needsSetup, checking, error, setupPassphrase, unlock, lock }
}
