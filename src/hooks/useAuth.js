// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import { supabase } from '../superbase/client'

const FRIENDLY_ERRORS = {
  'Invalid login credentials':       'Invalid email or password.',
  'User already registered':         'That email is already registered.',
  'Password should be at least 6':   'Password must be at least 6 characters.',
  'Unable to validate email address': 'Please enter a valid email address.',
}

function friendly(msg = '') {
  for (const [key, val] of Object.entries(FRIENDLY_ERRORS)) {
    if (msg.includes(key)) return val
  }
  return msg || 'Something went wrong. Please try again.'
}

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function register(email, password) {
    setError(null)
    const { error: e } = await supabase.auth.signUp({ email, password })
    if (e) { setError(friendly(e.message)); throw e }
  }

  async function login(email, password) {
    setError(null)
    const { error: e } = await supabase.auth.signInWithPassword({ email, password })
    if (e) { setError(friendly(e.message)); throw e }
  }

  async function logout() {
    setError(null)
    await supabase.auth.signOut()
  }

  return { user, loading, error, register, login, logout }
}
