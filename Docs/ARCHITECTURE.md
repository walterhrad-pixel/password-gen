# Architecture

## Runtime model

Vaultly is a single-page React application. Vite serves the application during development and produces static assets for deployment. There is no application-owned backend.

```
Browser
  └── React application
        ├── AuthPage ─────────── Supabase Auth
        ├── Generator UI ─────── Web Crypto API + zxcvbn
        ├── VaultUnlock ───────── vault key derivation and verification
        └── Vault ─────────────── Supabase Postgres through useVault
```

## Root state and rendering branches

`App.jsx` owns generator state, including the current password, generation mode, length, word count, random-mode options, label, clipboard state, and guest state. It composes the authentication, vault-key, and vault hooks.

The root render has three major branches:

| Condition | Rendered view |
| --- | --- |
| Session status is unresolved | Loading spinner. |
| No authenticated user and guest mode is disabled | Authentication page. |
| Authenticated user or guest mode is enabled | Generator and optional vault interface. |

Authenticated users receive a vault section whose state depends on whether the application is checking metadata, requires first-time setup, or has an unlocked key.

## Authentication flow

`useAuth.js` performs an initial `supabase.auth.getSession()` call. It then subscribes to `onAuthStateChange` and removes the subscription during cleanup. Registration, password login, and logout are exposed as small wrapper functions. Known Supabase errors are translated into user-readable messages.

## Generation flow

When a generation control changes, `App.jsx` calls one of three functions from `generatePassword.js`:

1. `generatePassword` creates a random character password.

1. `generatePronounceable` creates a syllable-based password.

1. `generatePassphrase` creates a hyphen-separated word passphrase.

`crypto.getRandomValues` provides random bytes for selection and shuffling. `calculateStrength` passes the resulting value to `zxcvbn` and maps its score into the UI meter.

## Vault key flow

`useVaultKey.js` checks whether the authenticated user has a row in `vault_meta`. On first setup, it generates a random salt, derives an AES-GCM key from the user’s separate vault passphrase, and stores an encrypted fixed-string check. On unlock, it derives a new key from the entered passphrase and decrypts the check. A failed authentication tag causes verification to return false.

The derived `CryptoKey` is held in React state. It is not written to local storage or session storage. A page refresh therefore locks the vault again.

## Vault persistence flow

`useVault.js` loads rows only when both a user and a vault key exist. It selects row identifiers, ciphertext, IVs, and timestamps. Each row is decrypted in the browser before being placed in React state.

On save, the password and trimmed label are encrypted as a JSON object. The resulting ciphertext and IV are inserted with the current user ID. On deletion, the database row is deleted and the local list is updated. Clear-all deletes all rows for the current user.

## Data model

| Table | Purpose | Sensitive fields |
| --- | --- | --- |
| `passwords` | One encrypted vault entry per saved password. | `ciphertext`, `iv` |
| `vault_meta` | One encryption metadata record per user. | `salt`, `check_ciphertext`, `check_iv` |

Both tables reference `auth.users`, enable Row Level Security, and use policies based on `auth.uid() = user_id`.

## References

[1]: ../src/App.jsx "Vaultly root React component"

[2]: ../src/hooks/useAuth.js "Vaultly authentication hook"

[3]: ../src/hooks/useVault.js "Vaultly encrypted vault persistence hook"

[4]: ../src/hooks/useVaultKey.js "Vaultly vault key management hook"

[5]: ../src/utils/generatePassword.js "Vaultly password generation and strength utilities"

[6]: ../src/utils/vaultCrypto.js "Vaultly vault cryptography utilities"

[7]: ../migration.sql "Vaultly Supabase database migration"
