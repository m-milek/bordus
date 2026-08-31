import { gzipSync, constants } from 'node:zlib'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join, extname } from 'node:path'

/**
 * Writes a .gz beside every compressible build artefact, for nginx's
 * `gzip_static`. Compressing once at maximum level beats compressing on every
 * request at a level chosen to keep latency down.
 */
// Deliberately no '.yaml': config.yaml can be replaced by a volume mount, and
// a stale .gz beside it would be served in preference to the real file.
const COMPRESSIBLE = new Set(['.js', '.css', '.html', '.svg', '.json'])
const MIN_BYTES = 1024

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(entry => {
      const path = join(dir, entry.name)
      return entry.isDirectory() ? walk(path) : [path]
    })
  )
  return files.flat()
}

const dist = process.argv[2] ?? 'dist'
let saved = 0
let count = 0

for (const file of await walk(dist)) {
  if (!COMPRESSIBLE.has(extname(file))) continue
  const raw = readFileSync(file)
  if (raw.length < MIN_BYTES) continue

  const gz = gzipSync(raw, { level: constants.Z_BEST_COMPRESSION })
  // A .gz that is no smaller would just waste a file and a stat() per request.
  if (gz.length >= raw.length) continue

  writeFileSync(`${file}.gz`, gz)
  saved += raw.length - gz.length
  count += 1
}

console.log(`precompressed ${count} files, saving ${(saved / 1024).toFixed(0)} kB on the wire`)
