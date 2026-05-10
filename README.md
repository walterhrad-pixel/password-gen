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
  <img src="https://img.shields.io/badge/License-MIT-white?style=flat-square" />
</p>

# Vaultly — Password Generator
 
A secure, browser-based password generator with user authentication and a personal password vault. Built with React, Vite, and Supabase. Every password a user generates can be saved with a custom label something like "Gmail" or "GitHub" and retrieved the next time they log in, from any device.
 
---

 ## Live Demo

[password-gen-lac.vercel.app](https://password-gen-lac.vercel.app/)

## What it does
When a user visits the app, they land on the authentication screen. They register with an email and password or sign in to an existing account. Supabase handles sessions, secure password hashing, and persistence across tabs and devices. Once signed in, the generator loads immediately.
 
**Generation modes**
 
- **Random** — compose from any combination of uppercase, lowercase, numerals, and symbols. Two optional flags: exclude visually similar characters (`0O1lI|`), or enforce at least one character from each selected class.
- **Pronounceable** — phonetically structured syllable chains that produce something that sounds like a word. Easier to type and remember without a meaningful drop in entropy.
- **Passphrase** — 3 to 8 random words joined with hyphens, producing something like `Coral-night-jazz-42`. Long, high-entropy, and far easier to recall than a random string.
**Strength meter** — a four-bar indicator (Weak, Fair, Good, Strong) recalculates on every change. Passphrases are scored by word count rather than character variety.
 
**Vault** — label any generated password and save it. Entries persist in Supabase, scoped to the authenticated user by Row Level Security at the database layer. Individual entries can be deleted, or the vault cleared entirely.
 
**UX** — one-click clipboard copy with a 2-second confirmation state. Press `Enter` anywhere to regenerate. Fully responsive down to 375px.
 
---
 
## Project Structure
 
```
passgen-vite/
├── index.html
├── vite.config.js
├── package.json
├── package-lock.json
├── .gitignore
└── src/
    ├── main.jsx                    React entry point
    ├── App.jsx                     Root component — generator UI, auth gate, vault save row
    ├── styles.css                  All styling, design tokens, responsive rules
    ├── superbase/
    │   └── client.js               Supabase client initialisation
    ├── hooks/
    │   ├── useAuth.js              Auth state — register, login, logout, session persistence
    │   └── useVault.js             Vault CRUD — load, save, delete, clear
    ├── components/
    │   ├── AuthPage.jsx            Animated login and registration screen
    │   └── Vault.jsx               Saved password list with label, copy, and delete per entry
    └── utils/
        └── generatePassword.js     All generation logic and strength calculator
```
 
---
 
## Architecture
 
No custom backend. All generation logic runs on the client. Supabase handles authentication and database persistence.
 
```
Browser
  └── React UI (Vite)
        ├── useAuth  ──→  Supabase Auth (session tokens, hashing)
        └── useVault ──→  Supabase Postgres (row-level security)
```
 
Row Level Security is enforced at the Postgres layer — not just filtered in application code. A signed-in user cannot read or modify another user's vault entries, even with a direct API request using a valid session token.
 
---
 
## How It Was Built
 
### Generation logic
 
The generation logic lives entirely in `src/utils/generatePassword.js` and exports four functions.
 
`generatePassword` takes a length and an options object. It uses `crypto.getRandomValues` from the Web Crypto API rather than `Math.random`. This matters — `Math.random` is not cryptographically secure and its output can be predicted. `crypto.getRandomValues` is backed by the operating system's entropy source and is the correct choice for generating passwords. When `mustContain` is enabled, the function guarantees at least one character from each enabled set, fills the remainder, then shuffles the result using a Fisher-Yates shuffle that also calls `crypto.getRandomValues` for every swap index.
 
`generatePronounceable` assembles passwords from a hardcoded list of two-character syllables, capitalises the first and occasionally others, then appends a two-digit number and a symbol.
 
`generatePassphrase` picks random words from a curated list and joins them with hyphens. The first word is capitalised, a number is appended, and the result is long enough to be secure without being difficult to recall.
 
`calculateStrength` scores a password from one to four based on length and the number of distinct character types. Passphrases are scored by word count. The score drives the four-segment coloured bar.
 
### Authentication
 
`useAuth.js` wraps all Supabase auth methods so no component ever imports Supabase directly.
 
On mount, it calls `supabase.auth.getSession()` to check for an existing valid session. This is what keeps users logged in across page refreshes — if a stored session token exists and has not expired, the user object resolves immediately and the auth screen never appears. It then subscribes to `supabase.auth.onAuthStateChange` for all subsequent state transitions.
 
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
 
`useVault.js` handles all database operations. It takes the current user as its only argument and re-runs its load query whenever the user changes.
 
The load query does not need a `WHERE user_id = ...` clause — Row Level Security filters automatically at the database level. Supabase returns only the rows that belong to the authenticated user. After every insert or delete, the local entries array updates immediately to keep the UI in sync without an extra network round trip.
 
### Auth screen
 
`AuthPage.jsx` manages a three-stage sequence: a brief splash screen that renders for 1.8 seconds, a landing screen with call-to-action buttons, and the form itself. The form slides up from below with a CSS `transform: translateY` transition. When authentication succeeds, Supabase fires `onAuthStateChange`, the user state in `App.jsx` updates, and React renders the generator. The auth screen does not navigate anywhere — it simply disappears.
 
### Vault component
 
`Vault.jsx` returns null when the entries array is empty, so the vault card does not appear until the user has saved something. Each entry shows the label, the password string in monospace with ellipsis truncation, a copy button, and a delete button. Timestamps use `toLocaleString` with `dateStyle: 'medium'` and `timeStyle: 'short'` — the user's local timezone, no date arithmetic required.
 
### Root component
 
`App.jsx` holds all generator state and connects every part of the application. The render function has three branches — loading spinner, auth screen, or generator — which prevents the auth screen from flashing on page load while the session check resolves.
 
Generator options are each listed individually as `useEffect` dependencies rather than passing the whole options object, which avoids triggering regeneration on unrelated renders. A second `useEffect` attaches a global `keydown` listener for Enter-to-regenerate with a cleanup function that removes it on unmount.
 
---
 
## Setup
 
### 1. Clone and install
 
```bash
git clone https://github.com/walterhrad-pixel/password-gen
cd password-gen
npm install
```
### 2. Create a Supabase project
 
Go to [supabase.com](https://supabase.com) and create a new project. Wait for provisioning to complete (roughly one minute). In Authentication → Providers → Email, confirm the provider is enabled. The default settings work without any changes.
 
### 3. Create the passwords table
 
Open the SQL Editor in the Supabase dashboard and run:
 
```sql
create table passwords (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users not null,
  password   text not null,
  label      text default '',
  created_at timestamptz default now()
);
 
alter table passwords enable row level security;
 
create policy "Users manage own passwords" on passwords
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```
 
The `id` is generated by Postgres, not the application. The `created_at` timestamp is set at the database level so it is accurate regardless of the client's clock. Row Level Security is enabled immediately — there is no window where the table is accessible without it.
 
### 4. Add your Supabase credentials
 
Open `src/superbase/client.js` and replace the placeholder strings with your project URL and anon key, both available under Project Settings → API.
 
```javascript
const SUPABASE_URL = "https://your-project-id.supabase.co"
const SUPABASE_KEY = "your-anon-public-key"
```
 
For any deployment beyond local development, use environment variables instead:
 
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY
```
 
Vite exposes any variable prefixed with `VITE_` to the client bundle via `import.meta.env`. Add them to your host's environment variable settings rather than committing them to the repository.
 
### 5. Run locally
 
```bash
npm run dev
```
 
Open `http://localhost:5173`. Register an account, generate a few passwords, save them with labels, then close the tab. Sign back in and the vault will be exactly as you left it.
 
---
 
## Deployment
 
```bash
npm run build
```
 
This produces a `dist` folder of static HTML, CSS, and JavaScript that can be served from any host.
 
For Vercel: push the repository to GitHub, import it at [vercel.com](https://vercel.com), and click Deploy. Vercel detects Vite automatically and configures the build command and output directory without any manual input. Add the Supabase credentials as environment variables in the project settings.
 
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| UI framework | React 18 |
| Build tool | Vite 5 |
| Backend-as-a-service | Supabase (Auth + Postgres) |
| Styling | Vanilla CSS with custom properties |
| Language | JavaScript (ESM) |
 
No CSS frameworks. No component libraries. No Redux. All styling is written by hand in `styles.css` using a custom property system for colors, radii, shadows, and spacing.
 
---
 
## Design
 
Near-black surfaces (`#0a0a0c`) with a single emerald accent (`#10b981`) a deliberate reference to classic terminal tooling, appropriate given the subject matter. System monospace for all credential display. A single radial gradient bloom at the top of the page is the only decorative element. All interactive transitions are 150ms with no ambient animation.
 
---
 
## Inspiration
 
This project was directly inspired by Edward Snowden's public writing and testimony on surveillance and personal privacy. His central argument that privacy is not about having something to hide, but about the right to control your own information is the reason this tool exists.
 
Weak, reused passwords are not just a personal inconvenience. They are an attack surface that states, corporations, and criminals have exploited systematically. Vaultly is an attempt to make strong credential hygiene accessible and frictionless for ordinary people, not only those with a technical background.
 
---
 
## Security Notes
 
**`crypto.getRandomValues`** is used throughout the generation logic. It is backed by the operating system's entropy source and is not predictable the way `Math.random` is. This is the correct choice for anything used as a password.
 
**The anon key** is not a secret. Supabase designs the anon key to be public — it is scoped entirely to the Row Level Security policies and cannot be used to circumvent them.
 
**Passwords are stored as plaintext** in Supabase. Row Level Security ensures no user can access another user's data, and Supabase encrypts all data at rest and in transit by default. Client-side encryption before storage is the recommended next step for a production-grade deployment.
 
---
 
## Known Limitations
 
**No client-side encryption.** Passwords are not encrypted in the browser before being sent to Supabase. A true zero-knowledge vault encrypts credentials on the client before any data leaves the device. This is the most significant gap between the current implementation and a production-grade security tool.
 
**Custom strength estimation.** The `calculateStrength` function does not account for dictionary attacks, keyboard walk patterns, or common substitutions. The `zxcvbn` library handles all of these and is the recommended replacement for any production deployment.
 
**Global `keydown` listener.** The Enter-to-regenerate shortcut is attached to `window` and can conflict with the auth form and vault input. The vault input already has a local override; the auth form should be reviewed for the same issue.
 
**No guest mode.** Password generation requires authentication. This prevents anonymous usage and scopes all data to a user, but it adds friction for anyone who only wants to generate without saving.
 
**Go module.** `go.mod` references Go 1.26.2, which does not exist at the time of writing. The module is not connected to the Vite build and appears to be groundwork for a planned companion tool — likely a CLI for offline generation.
 
---
 
## Roadmap (Future Improvements)
 
- Client-side encryption before vault writes
- `zxcvbn` integration for accurate strength estimation
- Export vault as an encrypted file
- Guest mode with session-only history
- Go CLI for offline password generation
---
 
## Dependencies
 
| Package | Purpose |
|---|---|
| `react` | UI component framework |
| `react-dom` | Renders React components into the browser DOM |
| `@supabase/supabase-js` | Auth and database client |
| `vite` | Development server and production build tool |
| `@vitejs/plugin-react` | JSX transformation and React fast refresh |
 
---
 
## License
 
Copyright &copy; 2026 Walter Onyango. All rights reserved.
 
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
