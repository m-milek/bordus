import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * Page height is proportional to container width here, because tiles are square
 * and sized from it. If the scrollbar is allowed to take width away, that forms
 * a loop -- overflow, scrollbar, narrower, shorter, no overflow, no scrollbar,
 * wider, overflow -- which never settles and visibly flickers the whole grid.
 *
 * Reserving the gutter is the only thing holding that shut, and it is a single
 * CSS declaration with nothing else referring to it, so it is easy to delete by
 * accident and impossible to notice in review.
 */
describe('scrollbar gutter', () => {
  const styles = readFileSync('src/styles.css', 'utf8')

  it('is reserved, so container width does not depend on content height', () => {
    expect(styles).toMatch(/html\s*\{[^}]*scrollbar-gutter:\s*stable/)
  })

  it('falls back to a reserved gutter where scrollbar-gutter is unsupported', () => {
    expect(styles).toMatch(/@supports not \(scrollbar-gutter: stable\)/)
    expect(styles).toMatch(/@supports not \(scrollbar-gutter: stable\)\s*\{\s*html\s*\{[^}]*overflow-y:\s*scroll/)
  })
})
