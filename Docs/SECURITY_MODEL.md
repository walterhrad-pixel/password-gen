# Security Model

## Security summary

Vaultly uses two separate security layers. Supabase Auth protects account access. A client-side encryption key protects vault contents. Supabase can authenticate a user and enforce ownership without receiving the vault passphrase or plaintext saved passwords.

## Password generation

Random-mode generation uses `crypto.getRandomValues`, which is designed for cryptographic randomness in the browser. The implementation can require at least one character from each selected class and then shuffles the result using the same secure random source.

Pronounceable and passphrase modes use the same secure random selection function. Their outputs are easier to type or remember, but their effective entropy depends on the fixed syllable and word lists in the source code and on the selected length or word count.

## Vault encryption

The vault passphrase is processed with PBKDF2 using SHA-256, a random 16-byte salt, and 250,000 iterations. The derived key is a non-extractable 256-bit AES-GCM `CryptoKey`.

Each saved record receives a fresh random 12-byte IV. The password and label are serialized as JSON and encrypted together. The database receives Base64-encoded ciphertext and IV values.

The application also encrypts a fixed check value. Unlocking derives a key from the entered passphrase and attempts to decrypt that check. AES-GCM authentication fails for a wrong key, allowing the application to reject the passphrase without storing it.

## Access control

Row Level Security is enabled for both tables. Policies require the authenticated Supabase user ID to match the row’s `user_id`. This is a database-side control and is stronger than relying only on client-side filters.

## Key lifetime and recovery

The derived vault key remains in React state only. It is not saved to `localStorage` or `sessionStorage`. A browser refresh removes the in-memory key and requires the vault to be unlocked again.

There is intentionally no vault-passphrase reset flow. Adding server-side recovery would require a recovery path capable of decrypting the vault, which would change the zero-knowledge design. Users must retain the vault passphrase.

## Security boundaries and limitations

Client-side encryption protects data in the database and during normal database access, but it does not protect a device that is already compromised while the vault is unlocked. Browser extensions, injected scripts, malicious dependencies, or an attacker with control of the running page could access plaintext while it is displayed or copied.

Clipboard contents are controlled by the browser and may remain available to other software according to the operating system’s clipboard behavior. Users should clear sensitive clipboard contents when appropriate.

The project contains no automated test suite in the supplied archive. Security-sensitive changes should therefore include manual verification and, preferably, dedicated tests for cryptographic round trips, wrong-passphrase rejection, Row Level Security, and deletion behavior.

## Operational recommendations

Use HTTPS in every deployed environment. Restrict Supabase redirect URLs to the intended application origins. Review dependency updates before deployment. Do not log plaintext passwords, vault passphrases, derived keys, or decrypted vault entries. Treat changes to `migration.sql` as security-sensitive because they can alter ownership controls or delete data.
