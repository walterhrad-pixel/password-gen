
import { useState, useEffect } from 'react'

const buildStyles = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  .vaultly-auth * { box-sizing: border-box; margin: 0; padding: 0; }

  .vaultly-auth {
    font-family: 'Nunito', sans-serif;
    width: 100vw;
    min-height: 100svh;
    min-height: 100vh;
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: ${dark ? '#0B0E1A' : '#fff'};
    transition: background 300ms ease;
  }

 // Dark mode toggle
  .va-theme-toggle {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 999;
    background: ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
    border: none;
    border-radius: 999px;
    width: 52px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 3px;
    transition: background 300ms ease;
  }

  .va-theme-knob {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${dark ? '#F5C842' : '#0B0E1A'};
    transform: translateX(${dark ? '24px' : '0px'});
    transition: transform 300ms cubic-bezier(.32,.72,0,1), background 300ms ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  // Screen 1: Splash
  .va-splash {
    position: fixed;
    inset: 0;
    background: #F5C842;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    transition: opacity 600ms ease, transform 600ms ease;
    z-index: 20;
  }

  .va-splash.exit {
    opacity: 0;
    transform: scale(1.08);
    pointer-events: none;
  }

  .va-splash-name {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 900;
    color: #0B0E1A;
    letter-spacing: -.02em;
    margin-top: 20px;
  }

  // Screen 2: Landing 
  .va-landing {
    position: fixed;
    inset: 0;
    background: ${dark ? '#0B0E1A' : '#fff'};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px clamp(24px, 6vw, 120px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 400ms ease, background 300ms ease;
    z-index: 10;
  }

  .va-landing.visible {
    opacity: 1;
    pointer-events: all;
  }

  .va-mascot-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(16px, 3vh, 32px);
    margin-bottom: clamp(32px, 6vh, 64px);
  }

  .va-brand {
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 900;
    color: ${dark ? '#fff' : '#0B0E1A'};
    letter-spacing: -.03em;
    transition: color 300ms ease;
  }

  .va-tagline {
    font-size: clamp(14px, 1.8vw, 18px);
    font-weight: 600;
    color: ${dark ? '#888' : '#999'};
    text-align: center;
    transition: color 300ms ease;
  }

  .va-btns {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .va-btn-primary {
    width: 100%;
    padding: clamp(14px, 2vh, 18px) 24px;
    background: #F5C842;
    color: #0B0E1A;
    font-size: clamp(13px, 1.4vw, 15px);
    font-weight: 800;
    font-family: 'Nunito', sans-serif;
    letter-spacing: .07em;
    text-transform: uppercase;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 150ms;
    box-shadow: 0 4px 0 #D4A500;
  }

  .va-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #D4A500; }
  .va-btn-primary:active { transform: translateY(2px); box-shadow: 0 2px 0 #D4A500; }

  .va-btn-secondary {
    width: 100%;
    padding: clamp(14px, 2vh, 18px) 24px;
    background: transparent;
    color: ${dark ? '#aaa' : '#888'};
    font-size: clamp(13px, 1.4vw, 15px);
    font-weight: 800;
    font-family: 'Nunito', sans-serif;
    letter-spacing: .07em;
    text-transform: uppercase;
    border: 2px solid ${dark ? '#2a2e42' : '#e0e0e0'};
    border-radius: 16px;
    cursor: pointer;
    transition: all 150ms;
  }

  .va-btn-secondary:hover {
    border-color: ${dark ? '#3a3e55' : '#ccc'};
    color: ${dark ? '#ddd' : '#555'};
  }
  .va-btn-secondary:active { transform: scale(.98); }

  /* ── Screen 3/4: Auth form (slides up) ── */
  .va-form-screen {
    position: fixed;
    inset: 0;
    background: ${dark ? '#0B0E1A' : '#fff'};
    display: flex;
    flex-direction: column;
    z-index: 30;
    transform: translateY(100%);
    transition: transform 450ms cubic-bezier(.32,.72,0,1), background 300ms ease;
    overflow-y: auto;
  }

  .va-form-screen.open {
    transform: translateY(0);
  }

  // Top yellow header 
  .va-form-top {
    background: #F5C842;
    padding: clamp(40px, 8vh, 72px) clamp(24px, 6vw, 80px) clamp(28px, 5vh, 48px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    position: relative;
    flex-shrink: 0;
  }

  .va-back-btn {
    position: absolute;
    top: clamp(14px, 3vh, 22px);
    left: clamp(14px, 3vw, 24px);
    background: rgba(0,0,0,0.1);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #0B0E1A;
    font-size: 20px;
    font-weight: 700;
    transition: background 150ms;
  }

  .va-back-btn:hover { background: rgba(0,0,0,0.18); }

  .va-form-title {
    font-size: clamp(20px, 2.5vw, 28px);
    font-weight: 900;
    color: #0B0E1A;
    letter-spacing: -.02em;
  }

  .va-form-sub {
    font-size: clamp(13px, 1.3vw, 15px);
    font-weight: 600;
    color: rgba(0,0,0,0.5);
  }

  // Form body
  .va-form-body {
    flex: 1;
    padding: clamp(24px, 5vh, 48px) clamp(24px, 6vw, 80px) clamp(32px, 6vh, 60px);
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 600px;
    width: 100%;
    align-self: center;
  }

  .va-field label {
    display: block;
    font-size: 11px;
    font-weight: 800;
    color: ${dark ? '#666' : '#bbb'};
    text-transform: uppercase;
    letter-spacing: .1em;
    margin-bottom: 7px;
    transition: color 300ms ease;
  }

  .va-field input {
    width: 100%;
    padding: clamp(12px, 2vh, 16px) 18px;
    background: ${dark ? '#141828' : '#f7f8fa'};
    border: 2px solid ${dark ? '#1e2438' : '#e8e8e8'};
    border-radius: 14px;
    color: ${dark ? '#fff' : '#0B0E1A'};
    font-size: clamp(14px, 1.4vw, 16px);
    font-weight: 600;
    font-family: 'Nunito', sans-serif;
    outline: none;
    transition: border-color 150ms, background 300ms, color 300ms;
  }

  .va-field input:focus {
    border-color: #F5C842;
    background: ${dark ? '#1a1f32' : '#fff'};
  }

  .va-field input::placeholder {
    color: ${dark ? '#3a3e55' : '#ccc'};
    font-weight: 500;
  }

  .va-error {
    padding: 13px 18px;
    background: ${dark ? '#2a0e0e' : '#fff0f0'};
    border: 2px solid ${dark ? '#5a1a1a' : '#ffd0d0'};
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    color: #e24b4a;
    display: none;
    transition: background 300ms, border-color 300ms;
  }

  .va-error.show { display: block; }

  .va-form-submit {
    margin-top: 8px;
    width: 100%;
    padding: clamp(14px, 2vh, 18px) 24px;
    background: #F5C842;
    color: #0B0E1A;
    font-size: clamp(13px, 1.4vw, 15px);
    font-weight: 800;
    font-family: 'Nunito', sans-serif;
    letter-spacing: .07em;
    text-transform: uppercase;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 150ms;
    box-shadow: 0 4px 0 #D4A500;
  }

  .va-form-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #D4A500; }
  .va-form-submit:active { transform: translateY(2px); box-shadow: 0 2px 0 #D4A500; }
  .va-form-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: 0 4px 0 #D4A500; }

  // Decorative orbs for landing 
  .va-orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    transition: opacity 400ms ease;
  }

  .va-orb-1 {
    width: clamp(200px, 35vw, 500px);
    height: clamp(200px, 35vw, 500px);
    top: -10%;
    right: -8%;
    background: ${dark ? 'rgba(245,200,66,0.06)' : 'rgba(245,200,66,0.12)'};
  }

  .va-orb-2 {
    width: clamp(150px, 25vw, 380px);
    height: clamp(150px, 25vw, 380px);
    bottom: -5%;
    left: -5%;
    background: ${dark ? 'rgba(245,200,66,0.04)' : 'rgba(245,200,66,0.08)'};
  }

  .va-landing-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
`

// ── Vault mascot SVG ──────────────────────────────────────────────────────────
function VaultMascot({ size = 120, smiling = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="54" fill="#1E2440" stroke="#F5C842" strokeWidth="4"/>
      <ellipse cx="38" cy="36" rx="14" ry="10" fill="rgba(255,255,255,0.06)" transform="rotate(-20 38 36)"/>
      <ellipse cx="44" cy="52" rx="9" ry="10" fill="white"/>
      <ellipse cx="76" cy="52" rx="9" ry="10" fill="white"/>
      <circle cx="46" cy="54" r="5" fill="#1E2440"/>
      <circle cx="78" cy="54" r="5" fill="#1E2440"/>
      <circle cx="48" cy="52" r="2" fill="white"/>
      <circle cx="80" cy="52" r="2" fill="white"/>
      {smiling ? (
        <path d="M47 68 Q60 82 73 68" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      ) : (
        <path d="M47 70 Q60 80 73 70" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      )}
      <circle cx="88" cy="84" r="12" fill="#0B0E1A" stroke="#F5C842" strokeWidth="2"/>
      <circle cx="93" cy="84" r="3" fill="#F5C842"/>
      <rect x="108" y="50" width="8" height="28" rx="4" fill="#F5C842"/>
      <rect x="109" y="54" width="4" height="20" rx="2" fill="#D4A500"/>
    </svg>
  )
}

//Main component 
export default function AuthPage({ login, register, error }) {
  const [dark, setDark] = useState(false)
  const [screen, setScreen] = useState('splash')
  const [splashOut, setSplashOut] = useState(false)
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  // Check system preference on mount
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(prefersDark)
  }, [])

  // Splash auto-advance
  useEffect(() => {
    if (screen !== 'splash') return
    const t1 = setTimeout(() => setSplashOut(true), 1800)
    const t2 = setTimeout(() => setScreen('landing'), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [screen])

  function openForm(type) {
    setEmail('')
    setPassword('')
    setLocalError('')
    setScreen(type)
  }

  function goBack() {
    setScreen('landing')
    setLocalError('')
  }

  async function handleSubmit() {
    setLocalError('')
    if (!email || !password) { setLocalError('Please fill in all fields.'); return }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters.'); return }

    setBusy(true)
    try {
      if (screen === 'register') {
        await register?.(email, password)
      } else {
        await login?.(email, password)
      }
    } catch {
      setLocalError(error || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const displayError = localError || error || ''
  const isForm = screen === 'register' || screen === 'login'

  return (
    <>
      <style>{buildStyles(dark)}</style>
      <div className="vaultly-auth">

        {/* ── Dark mode toggle ── */}
        {screen !== 'splash' && (
          <button
            className="va-theme-toggle"
            onClick={() => setDark(d => !d)}
            aria-label="Toggle dark mode"
          >
            <span className="va-theme-knob">{dark ? '☀' : '☾'}</span>
          </button>
        )}

        {/* ── Screen 1: Splash ── */}
        <div className={`va-splash ${splashOut ? 'exit' : ''}`}>
          <VaultMascot size={Math.min(180, window.innerWidth * 0.35)} smiling />
          <span className="va-splash-name">Vaultly</span>
        </div>

        {/* ── Screen 2: Landing ── */}
        <div className={`va-landing ${screen === 'landing' ? 'visible' : ''}`}>
          <div className="va-orb va-orb-1" />
          <div className="va-orb va-orb-2" />
          <div className="va-landing-inner">
            <div className="va-mascot-wrap">
              <VaultMascot size={Math.min(160, window.innerWidth * 0.28)} smiling />
              <div style={{ textAlign: 'center' }}>
                <p className="va-brand">Vaultly</p>
                <p className="va-tagline">Your passwords, safe forever.</p>
              </div>
            </div>
            <div className="va-btns">
              <button className="va-btn-primary" onClick={() => openForm('register')}>
                Get started
              </button>
              <button className="va-btn-secondary" onClick={() => openForm('login')}>
                I already have an account
              </button>
            </div>
          </div>
        </div>

        {/* ── Screen 3 & 4: Auth forms ── */}
        <div className={`va-form-screen ${isForm ? 'open' : ''}`}>
          <div className="va-form-top">
            <button className="va-back-btn" onClick={goBack}>←</button>
            <VaultMascot size={90} smiling={!displayError} />
            <p className="va-form-title">
              {screen === 'register' ? 'Create your vault' : 'Welcome back!'}
            </p>
            <p className="va-form-sub">
              {screen === 'register'
                ? 'Privacy is not an option...'
                : 'Sign in to access your vault'}
            </p>
          </div>

          <div className="va-form-body">
            {displayError && (
              <div className="va-error show">{displayError}</div>
            )}
            <div className="va-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="va-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={screen === 'login' ? 'current-password' : 'new-password'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            <button
              className="va-form-submit"
              onClick={handleSubmit}
              disabled={busy}
            >
              {busy
                ? (screen === 'register' ? 'Creating vault…' : 'Opening vault…')
                : (screen === 'register' ? 'Create account' : 'Sign in')}
            </button>
          </div>
        </div>

      </div>
    </>
  )
}
