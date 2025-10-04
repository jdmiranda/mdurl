const encodeCache = {}

// Pre-compiled hex digit lookup for fast validation
const hexDigitCodes = new Set([
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // 0-9
  65, 66, 67, 68, 69, 70, // A-F
  97, 98, 99, 100, 101, 102 // a-f
])

// Create a lookup array where anything but characters in `chars` string
// and alphanumeric chars is percent-encoded.
//
function getEncodeCache (exclude) {
  let cache = encodeCache[exclude]
  if (cache) { return cache }

  cache = encodeCache[exclude] = []

  for (let i = 0; i < 128; i++) {
    // Fast alphanumeric check using char codes
    // 0-9: 48-57, A-Z: 65-90, a-z: 97-122
    if ((i >= 48 && i <= 57) || (i >= 65 && i <= 90) || (i >= 97 && i <= 122)) {
      cache.push(String.fromCharCode(i))
    } else {
      cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2))
    }
  }

  for (let i = 0; i < exclude.length; i++) {
    cache[exclude.charCodeAt(i)] = exclude[i]
  }

  return cache
}

// Encode unsafe characters with percent-encoding, skipping already
// encoded sequences.
//
//  - string       - string to encode
//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
//
function encode (string, exclude, keepEscaped) {
  if (typeof exclude !== 'string') {
    // encode(string, keepEscaped)
    keepEscaped = exclude
    exclude = encode.defaultChars
  }

  if (typeof keepEscaped === 'undefined') {
    keepEscaped = true
  }

  const cache = getEncodeCache(exclude)
  let result = ''

  for (let i = 0, l = string.length; i < l; i++) {
    const code = string.charCodeAt(i)

    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
      // Fast hex digit check using character codes instead of regex
      const c1 = string.charCodeAt(i + 1)
      const c2 = string.charCodeAt(i + 2)
      if (hexDigitCodes.has(c1) && hexDigitCodes.has(c2)) {
        result += string.slice(i, i + 3)
        i += 2
        continue
      }
    }

    if (code < 128) {
      result += cache[code]
      continue
    }

    if (code >= 0xD800 && code <= 0xDFFF) {
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
        const nextCode = string.charCodeAt(i + 1)
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          result += encodeURIComponent(string[i] + string[i + 1])
          i++
          continue
        }
      }
      result += '%EF%BF%BD'
      continue
    }

    result += encodeURIComponent(string[i])
  }

  return result
}

encode.defaultChars = ";/?:@&=+$,-_.!~*'()#"
encode.componentChars = "-_.!~*'()"

export default encode
