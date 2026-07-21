const PBKDF2_ITERATIONS = 250000
const CHECK_PLAINTEXT = 'vaultly-passphrase-check'

function toBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
}

function fromBase64(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

function randomBytes(length) {
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return arr
}

export function generateSalt() {
  return toBase64(randomBytes(16))
}

export async function deriveKey(passphrase, saltB64) {
  const salt = fromBase64(saltB64)
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptJSON(key, data) {
  const iv = randomBytes(12)
  const plaintext = new TextEncoder().encode(JSON.stringify(data))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  return { ciphertext: toBase64(ciphertext), iv: toBase64(iv) }
}

export async function decryptJSON(key, ciphertextB64, ivB64) {
  const iv = fromBase64(ivB64)
  const ciphertext = fromBase64(ciphertextB64)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return JSON.parse(new TextDecoder().decode(plaintext))
}

export async function createPassphraseCheck(key) {
  return encryptJSON(key, { check: CHECK_PLAINTEXT })
}

export async function verifyPassphraseCheck(key, ciphertextB64, ivB64) {
  try {
    const result = await decryptJSON(key, ciphertextB64, ivB64)
    return result.check === CHECK_PLAINTEXT
  } catch {
    return false
  }
}
