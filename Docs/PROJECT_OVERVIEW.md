# Project Overview

## Purpose

Vaultly is a browser-based password generator with optional account-backed storage. It lets a visitor generate passwords without an account or sign in to maintain an encrypted personal vault across sessions and devices.

The application is implemented as a client-rendered React interface served by Vite. Password generation, strength analysis, and vault encryption run in the browser. Supabase provides authentication and PostgreSQL persistence.

## User experience

The application begins with an authentication screen. A visitor may register, sign in, or continue as a guest. Guest mode supports generation and clipboard copying but does not save passwords.

Authenticated users can generate a password, enter an optional label, and save the result to the vault. The first save requires creation of a separate vault passphrase. Returning users must unlock the vault before saved entries are loaded and decrypted.

## Generation modes

| Mode | Behavior | Main controls |
| --- | --- | --- |
| Random | Selects characters from enabled uppercase, lowercase, number, and symbol sets. | Length from 8–64; character classes; exclude-similar characters; require one character from every selected class. |
| Pronounceable | Builds a syllable chain, adds a two-digit number and a symbol, and formats the first or occasional syllables with capitalization. | Length from 8–64. |
| Passphrase | Selects words from the built-in word list, capitalizes the first word, appends a random number, and joins terms with hyphens by default. | 3–8 words. |

Random generation uses the browser Web Crypto API rather than `Math.random`. When the must-contain option is enabled, the implementation inserts one character from each selected character class and shuffles the final result.

## Strength analysis

The strength meter uses `zxcvbn`. The score considers dictionaries, common passwords, keyboard patterns, and substitutions in addition to length and character variety. The interface displays a four-segment meter, a label, and an estimated offline crack time when a password exists.

## Vault behavior

Vault entries contain an optional label, the generated password, and a creation timestamp. The label and password are encrypted together before insertion into Supabase. The database stores ciphertext and an initialization vector, not plaintext credentials.

The vault list supports copying an entry, deleting an entry, and clearing all entries. Delete actions require a second click within three seconds. The vault card is hidden when no entries exist.

## Interaction details

The interface regenerates a password when generation controls change. Pressing `Enter` anywhere in the application also regenerates the password. Copy actions use the browser clipboard API and display a temporary confirmation state. The layout is intended to remain usable down to a 375-pixel viewport width.

## Technology summary

| Area | Implementation |
| --- | --- |
| UI | React 18 |
| Build tool | Vite 5 |
| Authentication | Supabase Auth |
| Persistence | Supabase PostgreSQL |
| Client encryption | Web Crypto API, PBKDF2, AES-GCM |
| Strength estimation | `zxcvbn` |
| Deployment artifact | Static `dist` output from `vite build` |

## References

[1]: ../README.md "Vaultly project README"

[2]: ../src/App.jsx "Vaultly root React component"

[3]: ../src/utils/generatePassword.js "Vaultly password generation and strength utilities"

[4]: ../package.json "Vaultly package metadata and scripts"

