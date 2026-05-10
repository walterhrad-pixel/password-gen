// Copyright (c) 2026 Walter Onyango. All rights reserved.
// See LICENSE in the repository root for terms of use.
import { useState, useEffect, useCallback } from 'react'

import { generatePassword, generatePronounceable, generatePassphrase, calculateStrength }
  from './utils/generatePassword'

import { useAuth }  from './hooks/useAuth'
import { useVault } from './hooks/useVault'

import AuthPage from './components/AuthPage'
import Vault    from './components/Vault'

function App() {

  const [password, setPassword] = useState('')
  const [length, setLength]     = useState(16)
  const [wordCount, setWordCount] = useState(4)
  const [copied, setCopied]     = useState(false)
  const [mode, setMode]         = useState('random')
  const [label, setLabel]       = useState('')

  const [options, setOptions] = useState({
    uppercase:      true,
    lowercase:      true,
    numbers:        true,
    symbols:        false,
    excludeSimilar: false,
    mustContain:    false,
  })

  const { user, loading, error: authError, register, login, logout } = useAuth()
  const { entries, saving, savePassword, deleteEntry, clearAll } = useVault(user)

  const strength = calculateStrength(password, options, mode)

  const generate = useCallback(() => {
    let newPassword = ''
    if (mode === 'random') {
      newPassword = generatePassword(length, options)
    } else if (mode === 'pronounceable') {
      newPassword = generatePronounceable(length)
    } else if (mode === 'passphrase') {
      newPassword = generatePassphrase(wordCount)
    }
    setPassword(newPassword)
    setCopied(false)
  }, [length, wordCount, options, mode])

  const handleCopy = async (text = password) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleOptionChange = (key) => {
    if (key === 'excludeSimilar' || key === 'mustContain') {
      setOptions(prev => ({ ...prev, [key]: !prev[key] }))
      return
    }
    const newOptions = { ...options, [key]: !options[key] }
    const hasAtLeastOne = ['uppercase', 'lowercase', 'numbers', 'symbols'].some(k => newOptions[k])
    if (hasAtLeastOne) setOptions(newOptions)
  }

  async function handleSave() {
    await savePassword(password, label)
    setLabel('')
  }

  useEffect(() => {
    generate()
  }, [mode, length, wordCount,
      options.uppercase, options.lowercase,
      options.numbers, options.symbols,
      options.excludeSimilar, options.mustContain])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Enter') generate()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [generate])

  if (loading) {
    return (
      <div className="page" style={{ justifyContent: 'center' }}>
        <div style={{
          width: '32px', height: '32px',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin .7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) {
    return <AuthPage login={login} register={register} error={authError} />
  }

  return (
    <div className="page">
      <div className="shell">

        {/* Top bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 4px',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Hey, <span style={{ color: 'var(--accent)' }}>{user.email.split('@')[0]}</span>
          </span>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '999px',
              color: 'var(--muted)',
              fontSize: '12px',
              padding: '5px 14px',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>

        {/* Main card */}
        <div className="card">

          <header className="header">
            <h1 className="title">Password Generator</h1>
            <p className="subtitle">Generate secure, random passwords</p>
          </header>

          <div className="mode-selector">
            {[
              { key: 'random',        label: 'Random' },
              { key: 'pronounceable', label: 'Pronounceable' },
              { key: 'passphrase',    label: 'Passphrase' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`mode-btn ${mode === key ? 'active' : ''}`}
                onClick={() => setMode(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="password-display">
            <span className="password-text">{password || 'Select options'}</span>
          </div>

          <div className="strength-meter">
            <div className="strength-bars">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`strength-bar ${i < strength.score ? 'active' : ''}`}
                  data-level={strength.score}
                />
              ))}
            </div>
            <span className="strength-label">{strength.label}</span>
          </div>

          <div className="options-section">

            {mode === 'passphrase' ? (
              <div className="length-control">
                <div className="length-header">
                  <label htmlFor="wordCount">Words</label>
                  <span className="length-value">{wordCount}</span>
                </div>
                <input
                  type="range" id="wordCount" className="slider"
                  min="3" max="8" value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                />
              </div>
            ) : (
              <div className="length-control">
                <div className="length-header">
                  <label htmlFor="length">Length</label>
                  <span className="length-value">{length}</span>
                </div>
                <input
                  type="range" id="length" className="slider"
                  min="8" max="64" value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                />
              </div>
            )}

            {mode === 'random' && (
              <>
                <div className="checkboxes">
                  {[
                    { key: 'uppercase', label: 'Uppercase', hint: 'A-Z' },
                    { key: 'lowercase', label: 'Lowercase', hint: 'a-z' },
                    { key: 'numbers',   label: 'Numbers',   hint: '0-9' },
                    { key: 'symbols',   label: 'Symbols',   hint: '!@#$%' },
                  ].map(({ key, label, hint }) => (
                    <label key={key} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={options[key]}
                        onChange={() => handleOptionChange(key)}
                      />
                      <span className="checkbox-custom" />
                      <span className="checkbox-label">{label}</span>
                      <span className="checkbox-hint">{hint}</span>
                    </label>
                  ))}
                </div>

                <div className="extra-options">
                  {[
                    { key: 'excludeSimilar', label: 'Exclude similar', hint: '0O1lI|' },
                    { key: 'mustContain',    label: 'Must contain',    hint: 'At least 1 of each' },
                  ].map(({ key, label, hint }) => (
                    <label key={key} className="toggle-item">
                      <input
                        type="checkbox"
                        checked={options[key]}
                        onChange={() => handleOptionChange(key)}
                      />
                      <span className="toggle-custom" />
                      <div className="toggle-text">
                        <span className="toggle-label">{label}</span>
                        <span className="toggle-hint">{hint}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="actions">
            <button className="btn-primary" onClick={generate}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              Generate
            </button>
            <button className="btn-ghost" onClick={() => handleCopy()} disabled={!password}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Save to vault */}
          <div className="vault-save-row">
            <input
              className="vault-input"
              type="text"
              placeholder="Label it — e.g. Gmail, GitHub, Netflix…"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              className="vault-save-btn"
              onClick={handleSave}
              disabled={!password || saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

        </div>

        {/* Vault */}
        <Vault entries={entries} deleteEntry={deleteEntry} clearAll={clearAll} />

        <footer className="footer">
          <a href="https://github.com/walterhrad-pixel" target="_blank" rel="noopener noreferrer">
            Coded by Walter
          </a>
        </footer>

      </div>
    </div>
  )
}

export default App
