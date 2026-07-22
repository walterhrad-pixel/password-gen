<p align="center">
<pre align="center">
██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗██╗  ██╗   ██╗
██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝██║  ╚██╗ ██╔╝
██║   ██║███████║██║   ██║██║     ██║   ██║   ╚████╔╝
╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   ██║    ╚██╔╝
 ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   ███████╗██║
  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚══════╝╚═╝
</pre>
</p>
 
<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ECF8E?style=flat-square&logo=supabase&logoColor=black" />
  <img src="https://img.shields.io/badge/JavaScript-ESM-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
</p>

# Vaultly — Password Generator
 
A secure, browser-based password generator with user authentication and a personal password vault. Built with React, Vite, and Supabase. Every password a user generates can be saved with a custom label something like "Gmail" or "GitHub" and retrieved the next time they log in, from any device.
 
---

 ## Live Demo

[password-gen-lac.vercel.app](https://password-gen-lac.vercel.app/) ...CURRENTLY DOWN

### What it does
 
When a user visits the app, they land on the authentication screen. They can register with an email and password, sign in to an existing account, or continue as a guest to use the generator without saving anything. Supabase handles sessions, secure password hashing, and persistence across tabs and devices.
 
**Generation modes**
 
- **Random**: compose from any combination of uppercase, lowercase, numerals, and symbols. Two optional flags: exclude visually similar characters (`0O1lI|`), or enforce at least one character from each selected class.
- **Pronounceable**: phonetically structured syllable chains that produce something that sounds like a word. Easier to type and remember without a meaningful drop in entropy.
- **Passphrase**: 3 to 8 random words joined with hyphens, producing something like `Coral-night-jazz-42`. Long, high entropy, and far easier to recall than a random string.
**Strength meter**: powered by `zxcvbn`, which checks against dictionaries, common password lists, keyboard walk patterns (`qwerty`, `asdf`), and common substitutions, not just length and character variety. A password like `Password1!` scores high on the old length-and-variety heuristic but is correctly flagged as weak by `zxcvbn`. The meter also shows an estimated offline crack time.
 
**Vault**: label any generated password and save it. Before anything is sent to Supabase, it is encrypted in the browser with AES-GCM, using a key derived from a vault passphrase the user sets separately from their login password. Supabase only ever stores ciphertext. Individual entries can be deleted, or the vault cleared entirely, both with a confirm-before-delete step to prevent accidental loss.
 
**UX**: one-click clipboard copy with a confirmation state. Press `Enter` anywhere to regenerate. Fully responsive down to 375px.
 
---
 
## Project Structure
 
```
password-gen/
├── index.html
├── vite.config.js
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
├── migration.sql
└── src/
    ├── main.jsx                    React entry point
    ├── App.jsx                     Root component: generator UI, auth gate, vault save row
    ├── style.css                   All styling, design tokens, responsive rules
    ├── supabase/
    │   └── client.js               Supabase client initialisation, reads credentials from env
    ├── hooks/
    │   ├── useAuth.js              Auth state: register, login, logout, session persistence
    │   ├── useVaultKey.js          In-memory vault encryption key: setup, unlock, lock
    │   └── useVault.js             Vault CRUD: encrypts on save, decrypts on load
    ├── components/
    │   ├── AuthPage.jsx            Animated login and registration screen, plus guest entry
    │   ├── VaultUnlock.jsx         Vault passphrase setup and unlock screen
    │   └── Vault.jsx               Saved password list with label, copy, and delete per entry
    └── utils/
        ├── generatePassword.js     All generation logic, plus zxcvbn-backed strength scoring
        └── vaultCrypto.js          PBKDF2 key derivation and AES-GCM encrypt and decrypt
```
 
---
 
## Architecture
 
No custom backend. All generation and encryption logic runs on the client. Supabase handles authentication and database persistence, and never sees a plaintext password.
 
```
Browser
  └── React UI (Vite)
        ├── useAuth     ──→  Supabase Auth (session tokens, hashing)
        ├── useVaultKey ──→  Supabase Postgres (vault_meta: salt, passphrase check)
        └── useVault    ──→  Supabase Postgres (passwords: ciphertext, iv)
```
 
Row Level Security is enforced at the Postgres layer, not just filtered in application code. A signed-in user cannot read or modify another user's vault entries, even with a direct API request using a valid session token. On top of that, the `passwords` table itself never contains a readable password, only AES-GCM ciphertext, so even direct database access does not expose credentials.
 
---
 
## How It Was Built
 
### Generation logic
 
The generation logic lives entirely in `src/utils/generatePassword.js` and exports four functions.
 
`generatePassword` takes a length and an options object. It uses `crypto.getRandomValues` from the Web Crypto API rather than `Math.random`. This matters: `Math.random` is not cryptographically secure and its output can be predicted. `crypto.getRandomValues` is backed by the operating system's entropy source and is the correct choice for generating passwords. When `mustContain` is enabled, the function guarantees at least one character from each enabled set, fills the remainder, then shuffles the result using a Fisher-Yates shuffle that also calls `crypto.getRandomValues` for every swap index.
 
`generatePronounceable` assembles passwords from a hardcoded list of two-character syllables, capitalises the first and occasionally others, then appends a two-digit number and a symbol.
 
`generatePassphrase` picks random words from a curated list and joins them with hyphens. The first word is capitalised, a number is appended, and the result is long enough to be secure without being difficult to recall.
 
`calculateStrength` passes the generated password to `zxcvbn`, which returns a 0 to 4 score based on real attack patterns rather than a hand-rolled heuristic, and maps that onto the four-segment bar the UI already used.
 
### Vault encryption
 
`src/utils/vaultCrypto.js` handles the actual cryptography. A vault passphrase, typed once at setup, is run through PBKDF2 with 250,000 iterations and a random per-user salt to derive a non-extractable AES-GCM key: a `CryptoKey` that can encrypt and decrypt but whose raw bytes can never be read back out, even by the app's own code. Every save calls `encryptJSON`, which generates a fresh random IV and encrypts the password and label together. Every load calls `decryptJSON` with the matching IV.
 
To let a user confirm they typed the right passphrase without ever storing it, `createPassphraseCheck` encrypts a fixed known string with the freshly derived key. On unlock, `verifyPassphraseCheck` tries to decrypt that stored value: a wrong passphrase produces the wrong key, AES-GCM's authentication tag fails, decryption throws, and the check returns false. No passphrase or key material ever touches the network.
 
### Vault key management
 
`src/hooks/useVaultKey.js` wraps this into React state. On login, it checks whether a `vault_meta` row exists for the user. If not, `setupPassphrase` generates a salt, derives a key, creates the passphrase check, and writes all of it to `vault_meta`. If a row exists, `unlock` re-derives the key from whatever the user types and verifies it against the stored check before accepting it. The derived key itself lives only in a React `useState` value: never in localStorage, never in sessionStorage. A page refresh clears it by design, which is what makes the vault genuinely zero-knowledge instead of merely encrypted at rest. There is deliberately no "forgot passphrase" flow, since any mechanism that could recover it would mean the server could decrypt the vault too.
 
### Authentication
 
`useAuth.js` wraps all Supabase auth methods so no component ever imports Supabase directly.
 
On mount, it calls `supabase.auth.getSession()` to check for an existing valid session. This is what keeps users logged in across page refreshes: if a stored session token exists and has not expired, the user object resolves immediately and the auth screen never appears. It then subscribes to `supabase.auth.onAuthStateChange` for all subsequent state transitions.
 
```javascript
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
```
 
The cleanup function calls `subscription.unsubscribe()` on unmount to prevent memory leaks. The `register`, `login`, and `logout` functions translate Supabase error strings into readable messages a non-technical user can act on.
 
### Vault
 
`useVault.js` handles all database operations for the encrypted `passwords` table. It takes the current user and the derived vault key as its arguments, and only runs its load query once both are present.
 
The load query does not need a `WHERE user_id = ...` clause: Row Level Security filters automatically at the database level. Supabase returns only the rows that belong to the authenticated user. Each row's ciphertext is decrypted client-side before it ever reaches the UI. If a save to Supabase fails for any reason, the error is surfaced back to the UI instead of failing silently, so the user always knows whether something was actually saved.
 
### Auth screen
 
`AuthPage.jsx` manages a three-stage sequence: a brief splash screen that renders for 1.8 seconds, a landing screen with call-to-action buttons, and the form itself. The form slides up from below with a CSS `transform: translateY` transition. The landing screen also offers a "Continue without an account" option for guest mode. When authentication succeeds, Supabase fires `onAuthStateChange`, the user state in `App.jsx` updates, and React renders the generator. The auth screen does not navigate anywhere: it simply disappears.
 
### Vault unlock screen
 
`VaultUnlock.jsx` handles both first-time setup and returning unlocks. On setup, it requires the passphrase twice, enforces a minimum length, and requires an explicit checkbox acknowledging that the passphrase cannot be reset if lost, before allowing vault creation. On subsequent visits, it shows a single passphrase field and surfaces a clear error if the passphrase does not match.
 
### Vault component
 
`Vault.jsx` returns null when the entries array is empty, so the vault card does not appear until the user has saved something. Each entry shows the label, the decrypted password in monospace, a copy button, and a delete button. Delete and clear-all both require a second click within three seconds to confirm, after which the confirmation state automatically resets, so a single misclick cannot silently wipe an entry or the whole vault. Timestamps use `toLocaleString` with `dateStyle: 'medium'` and `timeStyle: 'short'`, the user's local timezone, no date arithmetic required.
 
### Root component
 
`App.jsx` holds all generator state and connects every part of the application. The render function has three branches: loading spinner, auth or guest screen, or generator, which prevents the auth screen from flashing on page load while the session check resolves. Within the generator view, the vault section itself has three states depending on whether the user is checking, needs to set up a passphrase, or has already unlocked it.
 
Generator options are each listed individually as `useEffect` dependencies rather than passing the whole options object, which avoids triggering regeneration on unrelated renders. A second `useEffect` attaches a global `keydown` listener for Enter-to-regenerate with a cleanup function that removes it on unmount.
 
---
 
## Setup (The Roadmap I Used)
 
### 1. Clone and install
 
```bash
git clone https://github.com/walterhrad-pixel/password-gen
cd password-gen
npm install
```
 
### 2. Create a Supabase project
 
Go to [supabase.com](https://supabase.com) and create a new project. Wait for provisioning to complete, roughly one minute. In Authentication > Providers > Email, confirm the provider is enabled. The default settings work without any changes.
 
### 3. Create the database schema
 
Open the SQL Editor in the Supabase dashboard and run the contents of [`migration.sql`](./migration.sql). It creates two tables:
 
- `passwords`: stores `ciphertext` and `iv` per entry, never a plaintext password.
- `vault_meta`: one row per user, holding their PBKDF2 salt and a passphrase-check ciphertext. Neither reveals the vault passphrase or the derived key.
Both tables have Row Level Security enabled with a `for all using (auth.uid() = user_id)` policy.
 
### 4. Add your Supabase credentials
 
Copy `.env.example` to `.env.local` and fill in your project URL and anon key, both available under Project Settings > API:
 
```bash
cp .env.example .env.local
```
 
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-public-key
```
 
Vite exposes any variable prefixed with `VITE_` to the client bundle via `import.meta.env`. `.env.local` is gitignored and should never be committed. For deployment, add the same two variables in your host's environment variable settings.
 
### 5. Run locally
 
```bash
npm run dev
```
 
Open `http://localhost:5173`. Register an account or continue as a guest, generate a few passwords, and if signed in, set up a vault passphrase the first time you save one. Close the tab, sign back in, unlock the vault with that passphrase, and the entries will be exactly as you left them, decrypted for you to read and copy.
 
---
 
## Deployment
 
```bash
npm run build
```
 
This produces a `dist` folder of static HTML, CSS, and JavaScript that can be served from any host.
 
For Vercel: push the repository to GitHub, import it at [vercel.com](https://vercel.com), and click Deploy. Vercel detects Vite automatically and configures the build command and output directory without any manual input. The Supabase credentials must also be added as environment variables in the Vercel project settings, since `.env.local` is never committed and the build server has no other way to see them.
 
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| UI framework | React 18 |
| Build tool | Vite 5 |
| Backend-as-a-service | Supabase (Auth + Postgres) |
| Encryption | Web Crypto API (PBKDF2, AES-GCM) |
| Strength estimation | zxcvbn |
| Styling | Vanilla CSS with custom properties |
| Language | JavaScript (ESM) |
 
No CSS frameworks. No component libraries. No Redux. All styling is written by hand in `style.css` using a custom property system for colors, radii, shadows, and spacing.
 
---
 
## Design
 
Near-black surfaces (`#0a0a0c`) with a single emerald accent (`#10b981`), a deliberate reference to classic terminal tooling, appropriate given the subject matter. System monospace for all credential display. A single radial gradient bloom at the top of the page is the only decorative element. All interactive transitions are 150ms with no ambient animation.
 
---
 
## Inspiration
 
This project was directly inspired by Edward Snowden's public writing and testimony on surveillance and personal privacy. His central argument, that privacy is not about having something to hide but about the right to control your own information, is the reason this tool exists.
 
Weak, reused passwords are not just a personal inconvenience. They are an attack surface that states, corporations, and criminals have exploited systematically. Vaultly is an attempt to make strong credential hygiene accessible and frictionless for ordinary people, not only those with a technical background. The zero-knowledge vault is a direct extension of that argument: a tool built on this premise should not itself be able to read the credentials it stores.
 
---
 
## Security Notes
 
**`crypto.getRandomValues`** is used throughout the generation logic, including for every Fisher-Yates swap index. It is backed by the operating system's entropy source and is not predictable the way `Math.random` is.
 
**The anon key** is not a secret. Supabase designs the anon key to be public. It is scoped entirely to the Row Level Security policies and cannot be used to circumvent them. It is loaded from an environment variable rather than committed, mainly for deployment hygiene, different keys per environment, rather than because the key itself is sensitive.
 
**Vault entries are encrypted client-side, zero-knowledge.** Before a password is saved, it is encrypted in the browser with AES-GCM, using a key derived through PBKDF2 (250,000 iterations) from a vault passphrase set separately from the login password. That passphrase, and the derived key, never leave the browser and are never sent to Supabase. Only ciphertext and a per-entry IV are stored. Supabase, and anyone with dashboard or database access including the project owner, can only see ciphertext.
 
This means the vault passphrase cannot be reset or recovered. There is no "forgot passphrase" flow, on purpose. Any mechanism that could recover it would mean the server could decrypt the vault, which defeats the point. If a user loses their vault passphrase, their existing encrypted entries are permanently unreadable. This tradeoff is disclosed in the setup UI itself, not just in this README.
 
---
 
## Known Limitations
 
**Passphrase strength for the vault itself is not enforced beyond a minimum length.** A weak vault passphrase undermines the encryption regardless of how strong the PBKDF2 parameters are. Running the passphrase through the same `zxcvbn` check used for generated passwords before allowing setup is a reasonable next step.
 
**No password rotation reminders.** The vault stores entries indefinitely with no prompts to update old or reused credentials.
 
**Bundle size.** `zxcvbn` ships its own frequency dictionaries and adds roughly 800KB to the production bundle. Fine for a personal project. A production deployment should lazy-load it only when a password is present, or switch to a lighter alternative like `zxcvbn-ts` with on-demand dictionary loading.
 
**Global `keydown` listener.** The Enter-to-regenerate shortcut is still attached to `window` in `App.jsx`. It is harmless, pressing Enter in the auth form or the vault-unlock form silently regenerates a password the user cannot see on that screen, but it is not fully scoped and can be tightened with a `stopPropagation` on those inputs.
 
---
 
## Roadmap (Future Improvements)
 
- Enforce a minimum `zxcvbn` score on the vault passphrase itself, not just generated passwords
- Export vault as an encrypted file, already zero-knowledge at rest, so export just needs to preserve that
- Lazy-load `zxcvbn` to cut initial bundle size
- Go CLI for offline password generation
---
 
## Dependencies
 
| Package | Purpose |
|---|---|
| `react` | UI component framework |
| `react-dom` | Renders React components into the browser DOM |
| `@supabase/supabase-js` | Auth and database client |
| `zxcvbn` | Realistic password strength estimation |
| `vite` | Development server and production build tool |
| `@vitejs/plugin-react` | JSX transformation and React fast refresh |
 
---
 
## License
 
Copyright (c) 2026 Walter Onyango. All rights reserved.
 
This software and its source code are the exclusive intellectual property of Walter Onyango. The code is made publicly visible for portfolio and reference purposes only.
 
**The following are strictly prohibited without explicit written permission from the copyright holder:**
 
- Copying or reproducing any part of this codebase
- Using this code or any derivative of it in a commercial or non-commercial product
- Distributing, sublicensing, or selling this code or any portion of it
- Deploying this software under a different name or brand
Viewing this repository does not grant any rights, license, or permission to use the code contained within it. Any unauthorized use constitutes copyright infringement and may be subject to legal action under applicable intellectual property law.
 
To request permission, open an issue or contact the author directly through GitHub.

 ---

Built with ❤️ by [Walter](https://github.com/walterhrad-pixel).
