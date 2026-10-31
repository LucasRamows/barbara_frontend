import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const dist = process.argv[2] ?? 'dist'
const fixture = process.argv[3]
const budgets = {
  initial: 220 * 1024,
  route: 50 * 1024,
  charts: 110 * 1024,
}

if (!existsSync(dist)) {
  console.error(`Bundle directory not found: ${dist}`)
  process.exit(1)
}

const files = readdirSync(dist, { recursive: true })
  .filter((file) => typeof file === 'string' && /\.(js|css)$/.test(file))
  .map((file) => {
    const path = join(dist, file)
    return { file, gzip: gzipSync(readFileSync(path)).length }
  })

const initial = files.filter(({ file }) => /index|main/i.test(file)).reduce((sum, item) => sum + item.gzip, 0)
const charts = files.filter(({ file }) => /chart|recharts|evolution/i.test(file)).reduce((sum, item) => sum + item.gzip, 0)
const route = files.filter(({ file }) => /student|personal/i.test(file)).reduce((sum, item) => sum + item.gzip, 0)
const checks = [
  ['initial', initial, budgets.initial],
  ['route', route, budgets.route],
  ['charts', charts, budgets.charts],
]

if (fixture) checks.push(['fixture', gzipSync(readFileSync(fixture)).length, 1])
let failed = false
for (const [name, actual, budget] of checks) {
  const ok = actual <= budget
  console.log(`${ok ? '✓' : '✗'} ${name}: ${actual} bytes gzip (budget ${budget})`)
  failed ||= !ok
}
process.exit(failed ? 1 : 0)
