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
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ECF8E?style=flat-square&logo=supabase&logoColor=black" />
  <img src="https://img.shields.io/badge/JavaScript-ESM-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/License-MIT-white?style=flat-square" />
</p>

# Vaultly — Password Generator
 
A secure, browser-based password generator with user authentication and a personal password vault. Built with React, Vite, and Supabase. Every password a user generates can be saved with a custom label — something like "Gmail" or "GitHub" — and retrieved the next time they log in, from any device.
 
---
 
## Live Demo

<Will update once deployed>
 
---
 
## What it does
 
When a user visits the app for the first time, they land on the authentication screen. They either register with an email and password or sign in to an existing account. Supabase handles all of this — session tokens, secure password hashing, persistence across tabs and devices. Once signed in, the main generator loads immediately.
 
The generator has three modes. Random mode builds a password from character sets the user selects. Pronounceable mode chains syllables together to produce something that sounds like a word, which makes it easier to type or remember while still being secure. Passphrase mode joins random words with dashes, producing something like `Coral-night-jazz-42` that is both long and memorable.
 
Any password the user generates can be saved to their vault. Before saving, they type a label into a small input field next to the Save button. That label gets stored alongside the password in Supabase. When they log in on another machine, their entire vault is there, with every entry labelled exactly as they left it.
 
---
 
## Project structure
 
```
passgen-vite/
    index.html                     HTML entry point
    vite.config.js                 Vite configuration
    package.json                   Dependencies and scripts
    package-lock.json              Locked dependency tree
    .gitignore                     Files excluded from git
 
    src/
        main.jsx                   React entry point — mounts App into the DOM
        App.jsx                    Root component — generator UI, auth gate, vault save row
        styles.css                 All styling — generator styles plus auth and vault additions
 
        superbase/
            client.js              Supabase client initialisation — URL and anon key live here
 
        hooks/
            useAuth.js             Authentication — register, login, logout, session state
            useVault.js            Vault — load, save, delete, and clear saved passwords
 
        components/
            AuthPage.jsx           Animated login and register screen
            Vault.jsx              Saved password list with label, copy, and delete per entry
 
        utils/
            generatePassword.js    All generation logic — random, pronounceable, passphrase, strength
```
 
---
 
## How the code was written, step by step
 
### Step 1 — Understanding the generator
 
The starting point was a plain React password generator with no backend, no accounts, and no persistence. It worked entirely in the browser. Before adding anything new, the first task was reading every line of it — understanding the three generation modes, how the strength meter calculated its score, what the checkboxes and sliders were doing to state, and why the in-session history list worked the way it did. All of that state lived inside a single `App.jsx` using React's `useState` and `useEffect`.
 
### Step 2 — Separating the generation logic
 
The generation logic was pulled out of `App.jsx` and moved into its own file before anything else was changed. This made the component easier to read and the logic easier to test mentally.
 
`src/utils/generatePassword.js` exports four functions.
 
`generatePassword` takes a length and an options object. The options object tells it which character sets to use — uppercase, lowercase, numbers, symbols — and two extra flags: `excludeSimilar`, which strips visually ambiguous characters like zero and capital O, and `mustContain`, which guarantees at least one character from each enabled set. Internally it uses `crypto.getRandomValues` from the Web Crypto API rather than `Math.random`. This matters because `Math.random` is not cryptographically secure — it is seeded from a predictable source and its output can be predicted if an attacker knows enough about the environment. `crypto.getRandomValues` is backed by the operating system's entropy source and is appropriate for generating passwords. The function fills a `Uint32Array` with random bytes, then maps each value to an index in the character string using the modulo operator. When `mustContain` is enabled, it picks one character from each enabled set first, then fills the remainder, then shuffles the whole array using a Fisher-Yates shuffle that also calls `crypto.getRandomValues` for each swap index so no position in the shuffle is predictable either.
 
`generatePronounceable` assembles a password from a hardcoded list of two-character syllables. It picks syllables at random, capitalises the first one and occasionally capitalises others, then always appends a two-digit number and a symbol. The result sounds like a word when read aloud, which makes it easier to remember or type on a phone keyboard.
 
`generatePassphrase` picks random words from a list of 64 common English words and joins them with hyphens. The first word is capitalised. A random number is appended at the end. The result looks like `Amber-river-solar-67` and is long enough to be secure without being impossible to memorise.
 
`calculateStrength` scores a password from one to four. It looks at the length and the number of distinct character types. Passphrases are scored by word count instead, since character variety does not apply in the same way. The score drives the four-segment coloured bar in the UI.
