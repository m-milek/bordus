import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { CATEGORY_ICONS } from './categoryIcons'
import { parseConfig } from './config'

/**
 * Bundling only the icons we name is what keeps lucide-react out of the
 * critical path, so the cost is that an unlisted name renders nothing. This
 * catches that at build time for the config we ship.
 */
describe('category icons', () => {
  for (const file of ['config.example.yaml', 'public/config.yaml']) {
    it(`resolves every icon named in ${file}`, () => {
      const config = parseConfig(readFileSync(file, 'utf8'))
      const named = (config.categories ?? [])
        .map(category => category.icon)
        .filter((icon): icon is string => Boolean(icon))
        // A path or URL is handled as an <img>, not looked up here.
        .filter(icon => !icon.includes('/') && !icon.includes('.'))

      expect(named.length).toBeGreaterThan(0)
      expect(named.filter(icon => !CATEGORY_ICONS[icon.toLowerCase()])).toEqual([])
    })
  }

  it('keys every icon in the kebab-case form config uses', () => {
    for (const name of Object.keys(CATEGORY_ICONS)) {
      expect(name).toBe(name.toLowerCase())
      expect(name).not.toMatch(/[^a-z0-9-]/)
    }
  })
})
