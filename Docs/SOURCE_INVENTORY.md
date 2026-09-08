# Source Inventory

The following inventory describes the files present in the supplied project archive.

| Path | Responsibility |
| --- | --- |
| `index.html` | HTML document shell used by Vite. |
| `vite.config.js` | Vite configuration and React plugin setup. |
| `package.json` | Project metadata, dependencies, and development scripts. |
| `package-lock.json` | Locked npm dependency resolution. |
| `.env.example` | Template for Supabase URL and anonymous key variables. |
| `.gitignore` | Files excluded from version control, including local environment data. |
| `LICENSE` | Project license text. |
| `README.md` | Existing project description, architecture notes, and setup roadmap. |
| `migration.sql` | Supabase schema, Row Level Security enablement, and ownership policies. |
| `src/main.jsx` | React DOM entrypoint that mounts the root application. |
| `src/App.jsx` | Root state container, generator behavior, authentication gate, and vault composition. |
| `src/style.css` | Application styling, design tokens, controls, layout, and responsive rules. |
| `src/components/AuthPage.jsx` | Registration, login, splash, landing, and guest-entry interface. |
| `src/components/VaultUnlock.jsx` | First-time vault setup and returning-user unlock interface. |
| `src/components/Vault.jsx` | Saved-entry list, copy controls, and confirmation-based deletion. |
| `src/hooks/useAuth.js` | Supabase session loading, auth event subscription, registration, login, and logout. |
| `src/hooks/useVaultKey.js` | Vault metadata lookup, passphrase setup, key derivation, unlock, and lock state. |
| `src/hooks/useVault.js` | Encrypted vault loading, saving, deletion, and clear-all operations. |
| `src/supabase/client.js` | Supabase client initialization from Vite environment variables. |
| `src/utils/generatePassword.js` | Secure random generation, pronounceable generation, passphrase generation, and strength scoring. |
| `src/utils/vaultCrypto.js` | Salt generation, PBKDF2 derivation, AES-GCM encryption/decryption, and passphrase checks. |

## Dependency inventory

| Dependency | Role |
| --- | --- |
| `react` and `react-dom` | Component rendering and browser mounting. |
| `@supabase/supabase-js` | Supabase authentication and database client. |
| `zxcvbn` | Password strength and offline crack-time estimation. |
| `vite` | Development server and production bundling. |
| `@vitejs/plugin-react` | React support in Vite. |
