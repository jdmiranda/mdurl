import { parse, encode, decode, format } from './index.mjs'

// Benchmark configuration
const ITERATIONS = 100000
const WARMUP = 10000

// Test URLs representing common patterns
const testUrls = [
  'http://example.com',
  'https://example.com:8080/path/to/resource?query=value#hash',
  'http://user:pass@example.com/path',
  'https://example.com/api/v1/users?id=123&name=test',
  '/relative/path?search=query',
  'http://192.168.1.1:3000/endpoint',
  'https://subdomain.example.com/deep/nested/path/file.html',
  'http://example.com?param1=value1&param2=value2&param3=value3',
  'https://example.com/path/with/many/segments/here',
  'http://localhost:8080'
]

// Test strings for encode/decode
const testStrings = [
  'hello world',
  'test@example.com',
  'path/to/resource',
  'query=value&param=test',
  'special chars: !@#$%^&*()',
  'unicode: \u00e9\u00e0\u00fc',
  'already%20encoded',
  'mixed%20and unencoded',
  'long string with many words and spaces that needs encoding',
  'https://example.com/path?query=value'
]

function benchmark (name, fn, iterations = ITERATIONS) {
  // Warmup
  for (let i = 0; i < WARMUP; i++) {
    fn()
  }

  // Measure
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = performance.now()

  const totalTime = end - start
  const opsPerSec = Math.round((iterations / totalTime) * 1000)
  const timePerOp = (totalTime / iterations).toFixed(4)

  console.log(`${name}:`)
  console.log(`  ${opsPerSec.toLocaleString()} ops/sec`)
  console.log(`  ${timePerOp} ms/op`)
  console.log(`  ${totalTime.toFixed(2)} ms total for ${iterations.toLocaleString()} iterations`)
  console.log()

  return opsPerSec
}

console.log('='.repeat(60))
console.log('mdurl Performance Benchmark')
console.log('='.repeat(60))
console.log()

// Parse benchmarks
console.log('PARSE BENCHMARKS')
console.log('-'.repeat(60))

let urlIndex = 0
benchmark('parse() - mixed URLs', () => {
  parse(testUrls[urlIndex++ % testUrls.length])
}, ITERATIONS)

benchmark('parse() - same URL (cache hit)', () => {
  parse('https://example.com/path?query=value#hash')
}, ITERATIONS)

benchmark('parse() - simple path', () => {
  parse('/simple/path?query=value')
}, ITERATIONS)

benchmark('parse() - complex URL', () => {
  parse('https://user:pass@subdomain.example.com:8080/deep/path?q1=v1&q2=v2#fragment')
}, ITERATIONS)

console.log()

// Encode benchmarks
console.log('ENCODE BENCHMARKS')
console.log('-'.repeat(60))

let strIndex = 0
benchmark('encode() - mixed strings', () => {
  encode(testStrings[strIndex++ % testStrings.length])
}, ITERATIONS)

benchmark('encode() - no encoding needed', () => {
  encode('simplestring123')
}, ITERATIONS)

benchmark('encode() - heavy encoding', () => {
  encode('special chars: !@#$%^&*() and spaces')
}, ITERATIONS)

benchmark('encode() - already encoded', () => {
  encode('already%20encoded%20string', undefined, true)
}, ITERATIONS)

console.log()

// Decode benchmarks
console.log('DECODE BENCHMARKS')
console.log('-'.repeat(60))

benchmark('decode() - mixed encoded strings', () => {
  const encoded = [
    'hello%20world',
    'test%40example.com',
    'path%2Fto%2Fresource',
    'query%3Dvalue%26param%3Dtest'
  ]
  decode(encoded[strIndex++ % encoded.length])
}, ITERATIONS)

benchmark('decode() - simple decode', () => {
  decode('hello%20world')
}, ITERATIONS)

benchmark('decode() - no decoding needed', () => {
  decode('nodecoding')
}, ITERATIONS)

benchmark('decode() - heavy decoding', () => {
  decode('special%20chars%3A%20%21%40%23%24%25%5E%26%2A%28%29')
}, ITERATIONS)

console.log()

// Format benchmarks
console.log('FORMAT BENCHMARKS')
console.log('-'.repeat(60))

const parsedUrl = parse('https://user@example.com:8080/path?query=value#hash')
benchmark('format() - full URL object', () => {
  format(parsedUrl)
}, ITERATIONS)

const simpleParsed = parse('/simple/path')
benchmark('format() - simple path object', () => {
  format(simpleParsed)
}, ITERATIONS)

console.log()

// Combined workflow benchmark
console.log('COMBINED WORKFLOW BENCHMARKS')
console.log('-'.repeat(60))

benchmark('parse() + format() round-trip', () => {
  const url = 'https://example.com:8080/path?query=value#hash'
  const parsed = parse(url)
  format(parsed)
}, ITERATIONS / 2)

benchmark('encode() + decode() round-trip', () => {
  const str = 'hello world & special chars!'
  const encoded = encode(str)
  decode(encoded)
}, ITERATIONS / 2)

console.log('='.repeat(60))
console.log('Benchmark complete!')
console.log('='.repeat(60))
