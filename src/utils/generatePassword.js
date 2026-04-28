const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

const SIMILAR_CHARS = '0O1lI|`'

const WORD_LIST = [
  'apple', 'brave', 'cloud', 'delta', 'eagle', 'flame', 'grape', 'hotel',
  'ivory', 'jazz', 'kite', 'lemon', 'mango', 'night', 'ocean', 'piano',
  'queen', 'river', 'storm', 'tiger', 'ultra', 'vivid', 'water', 'xenon',
  'yacht', 'zebra', 'alpha', 'blaze', 'coral', 'dawn', 'ember', 'frost',
  'glide', 'honey', 'indie', 'jewel', 'karma', 'lunar', 'maple', 'noble',
  'oasis', 'pearl', 'quest', 'royal', 'solar', 'trend', 'urban', 'vital',
  'whale', 'xray', 'youth', 'zephyr', 'amber', 'beach', 'crisp', 'drift',
  'echo', 'fern', 'glow', 'haven', 'isle', 'jade', 'keen', 'light'
]

const SYLLABLES = [
  'ba', 'be', 'bi', 'bo', 'bu', 'ca', 'ce', 'ci', 'co', 'cu',
  'da', 'de', 'di', 'do', 'du', 'fa', 'fe', 'fi', 'fo', 'fu',
  'ga', 'ge', 'gi', 'go', 'gu', 'ha', 'he', 'hi', 'ho', 'hu',
  'ja', 'je', 'ji', 'jo', 'ju', 'ka', 'ke', 'ki', 'ko', 'ku',
  'la', 'le', 'li', 'lo', 'lu', 'ma', 'me', 'mi', 'mo', 'mu',
  'na', 'ne', 'ni', 'no', 'nu', 'pa', 'pe', 'pi', 'po', 'pu',
  'ra', 're', 'ri', 'ro', 'ru', 'sa', 'se', 'si', 'so', 'su',
  'ta', 'te', 'ti', 'to', 'tu', 'va', 've', 'vi', 'vo', 'vu',
  'wa', 'we', 'wi', 'wo', 'xa', 'xe', 'ya', 'ye', 'yo', 'za', 'ze', 'zi', 'zo', 'zu'
]

function getSecureRandom(max) {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}

function shuffleArray(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandom(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generatePassword(length, options) {
  const { uppercase, lowercase, numbers, symbols, excludeSimilar, mustContain } = options

  let chars = ''
  const requiredChars = []

  let upperSet = CHAR_SETS.uppercase
  let lowerSet = CHAR_SETS.lowercase
  let numberSet = CHAR_SETS.numbers
  let symbolSet = CHAR_SETS.symbols

  if (excludeSimilar) {
    upperSet = upperSet.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('')
    lowerSet = lowerSet.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('')
    numberSet = numberSet.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('')
    symbolSet = symbolSet.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('')
  }

  if (uppercase) {
    chars += upperSet
    if (mustContain) requiredChars.push(upperSet[getSecureRandom(upperSet.length)])
  }
  if (lowercase) {
    chars += lowerSet
    if (mustContain) requiredChars.push(lowerSet[getSecureRandom(lowerSet.length)])
  }
  if (numbers) {
    chars += numberSet
    if (mustContain) requiredChars.push(numberSet[getSecureRandom(numberSet.length)])
  }
  if (symbols) {
    chars += symbolSet
    if (mustContain) requiredChars.push(symbolSet[getSecureRandom(symbolSet.length)])
  }

  if (!chars) return ''

  const array = new Uint32Array(length)
  crypto.getRandomValues(array)

  let passwordChars = []

  if (mustContain && requiredChars.length > 0) {
    passwordChars = [...requiredChars]
    for (let i = requiredChars.length; i < length; i++) {
      passwordChars.push(chars[array[i] % chars.length])
    }
    passwordChars = shuffleArray(passwordChars)
  } else {
    for (let i = 0; i < length; i++) {
      passwordChars.push(chars[array[i] % chars.length])
    }
  }

  return passwordChars.join('')
}

export function generatePronounceable(length) {
  let password = ''
  const numSyllables = Math.ceil(length / 2)

  for (let i = 0; i < numSyllables; i++) {
    const syllable = SYLLABLES[getSecureRandom(SYLLABLES.length)]
    if (i === 0 || getSecureRandom(3) === 0) {
      password += syllable.charAt(0).toUpperCase() + syllable.slice(1)
    } else {
      password += syllable
    }
  }

  // Add a number and symbol at the end
  password += getSecureRandom(100)
  const symbols = '!@#$%&*'
  password += symbols[getSecureRandom(symbols.length)]

  return password.slice(0, Math.max(length, password.length))
}

export function generatePassphrase(wordCount = 4, separator = '-') {
  const words = []

  for (let i = 0; i < wordCount; i++) {
    let word = WORD_LIST[getSecureRandom(WORD_LIST.length)]
    // Capitalize first letter of first word
    if (i === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }
    words.push(word)
  }

  // Add a random number at the end
  words.push(getSecureRandom(100).toString())

  return words.join(separator)
}

export function calculateStrength(password, options, mode = 'random') {
  if (!password) return { score: 0, label: 'None' }

  const length = password.length

  if (mode === 'passphrase') {
    const wordCount = password.split('-').length
    if (wordCount >= 5) return { score: 4, label: 'Strong' }
    if (wordCount >= 4) return { score: 3, label: 'Good' }
    if (wordCount >= 3) return { score: 2, label: 'Fair' }
    return { score: 1, label: 'Weak' }
  }

  // Count character types
  let variety = 0
  if (options.uppercase) variety++
  if (options.lowercase) variety++
  if (options.numbers) variety++
  if (options.symbols) variety++

  // Calculate score (1-4)
  let score = 0

  // Length contribution
  if (length >= 8) score++
  if (length >= 16) score++

  // Variety contribution
  if (variety >= 2) score++
  if (variety >= 4) score++

  score = Math.min(4, Math.max(1, score))

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return {
    score,
    label: labels[score]
  }
}
