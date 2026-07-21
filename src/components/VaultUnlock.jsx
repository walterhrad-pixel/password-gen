import { useState } from 'react'

export default function VaultUnlock({ vaultKeyState, needsSetup }) {
  const { setupPassphrase, unlock, error } = vaultKeyState
  const [passphrase, setPassphrase] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  async function handleSetup() {
    setLocalError('')
    if (passphrase.length < 8) { setLocalError('Use at least 8 characters.'); return }
    if (passphrase !== confirm) { setLocalError('Passphrases do not match.'); return }
    if (!acknowledged) { setLocalError('Please confirm you understand the passphrase cannot be recovered.'); return }
    setBusy(true)
    try {
      await setupPassphrase(passphrase)
    } finally {
      setBusy(false)
    }
  }

  async function handleUnlock() {
    setLocalError('')
    setBusy(true)
    try {
      await unlock(passphrase)
    } finally {
      setBusy(false)
    }
  }

  const displayError = localError || error

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      {needsSetup ? (
        <>
          <h2 style={{ fontSize: '15px', marginBottom: '4px' }}>Set up your vault</h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
            This passphrase encrypts your vault in the browser before anything is saved.
            It is separate from your login password and is never sent anywhere —
            <strong> if you forget it, saved entries cannot be recovered.</strong>
          </p>
          <input
            className="vault-input"
            type="password"
            placeholder="Vault passphrase (min 8 characters)"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            style={{ marginBottom: '8px', width: '100%' }}
          />
          <input
            className="vault-input"
            type="password"
            placeholder="Confirm passphrase"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ marginBottom: '8px', width: '100%' }}
          />
          <label style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--muted)', marginBottom: '12px', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={() => setAcknowledged(a => !a)}
              style={{ marginTop: '2px' }}
            />
            I understand this passphrase cannot be reset or recovered if lost.
          </label>
          {displayError && <p style={{ fontSize: '12px', color: '#e5484d', marginBottom: '8px' }}>{displayError}</p>}
          <button className="vault-save-btn" onClick={handleSetup} disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Setting up…' : 'Create vault'}
          </button>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: '15px', marginBottom: '4px' }}>Unlock your vault</h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
            Enter your vault passphrase to decrypt your saved entries for this session.
          </p>
          <input
            className="vault-input"
            type="password"
            placeholder="Vault passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            style={{ marginBottom: '8px', width: '100%' }}
          />
          {displayError && <p style={{ fontSize: '12px', color: '#e5484d', marginBottom: '8px' }}>{displayError}</p>}
          <button className="vault-save-btn" onClick={handleUnlock} disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Unlocking…' : 'Unlock'}
          </button>
        </>
      )}
    </div>
  )
}
