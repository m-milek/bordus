import { describe, it, expect } from 'vitest'
import { wrapCompactor } from './wrapCompactor'
import type { Layout } from 'react-grid-layout/core'

const tiles = (...positions: [string, number, number][]): Layout =>
  positions.map(([i, x, y]) => ({ i, x, y, w: 1, h: 1 }))

const at = (layout: Layout, i: string) => {
  const item = layout.find(l => l.i === i)!
  return [item.x, item.y]
}

describe('wrapCompactor', () => {
  it('reorders within the row instead of pushing a tile onto a new one', () => {
    // c dragged onto a's slot in a three-wide category. The stock vertical
    // compactor strands a on a second row; this shifts a and b along instead.
    const packed = wrapCompactor.compact(tiles(['c', 0, 0], ['a', 0, 0], ['b', 1, 0]), 3)

    expect(at(packed, 'c')).toEqual([0, 0])
    expect(at(packed, 'a')).toEqual([1, 0])
    expect(at(packed, 'b')).toEqual([2, 0])
    expect(Math.max(...packed.map(l => l.y + l.h))).toBe(1)
  })

  it('wraps onto a new row only when the tiles genuinely need one', () => {
    const packed = wrapCompactor.compact(
      tiles(['a', 0, 0], ['b', 1, 0], ['c', 2, 0], ['d', 0, 1]),
      3
    )
    expect(at(packed, 'd')).toEqual([0, 1])
    expect(Math.max(...packed.map(l => l.y + l.h))).toBe(2)
  })

  it('closes the gap a removed or moved tile leaves behind', () => {
    const packed = wrapCompactor.compact(tiles(['a', 0, 0], ['b', 2, 0], ['c', 1, 1]), 3)
    expect(at(packed, 'a')).toEqual([0, 0])
    expect(at(packed, 'b')).toEqual([1, 0])
    expect(at(packed, 'c')).toEqual([2, 0])
  })

  it('flows around a wide tile rather than overlapping it', () => {
    const layout: Layout = [
      { i: 'wide', x: 0, y: 0, w: 2, h: 1 },
      { i: 'a', x: 2, y: 0, w: 1, h: 1 },
      { i: 'b', x: 0, y: 1, w: 1, h: 1 }
    ]
    const packed = wrapCompactor.compact(layout, 3)
    expect(at(packed, 'wide')).toEqual([0, 0])
    expect(at(packed, 'a')).toEqual([2, 0])
    expect(at(packed, 'b')).toEqual([0, 1])
  })

  it('tucks a short tile into the space beside a tall one', () => {
    const layout: Layout = [
      { i: 'tall', x: 0, y: 0, w: 1, h: 2 },
      { i: 'a', x: 1, y: 0, w: 1, h: 1 },
      { i: 'b', x: 2, y: 0, w: 1, h: 1 },
      { i: 'c', x: 0, y: 2, w: 1, h: 1 }
    ]
    const packed = wrapCompactor.compact(layout, 3)
    expect(at(packed, 'tall')).toEqual([0, 0])
    // c belongs on the second row, in the gap the tall tile leaves open.
    expect(at(packed, 'c')).toEqual([1, 1])
    expect(Math.max(...packed.map(l => l.y + l.h))).toBe(2)
  })

  it('clamps a tile wider than the category', () => {
    const packed = wrapCompactor.compact([{ i: 'a', x: 0, y: 0, w: 5, h: 1 }], 3)
    expect(packed[0].w).toBe(3)
    expect(at(packed, 'a')).toEqual([0, 0])
  })

  it('leaves static tiles where they are', () => {
    const layout: Layout = [
      { i: 'pinned', x: 2, y: 0, w: 1, h: 1, static: true },
      { i: 'a', x: 0, y: 0, w: 1, h: 1 },
      { i: 'b', x: 1, y: 0, w: 1, h: 1 },
      { i: 'c', x: 0, y: 1, w: 1, h: 1 }
    ]
    const packed = wrapCompactor.compact(layout, 3)
    expect(at(packed, 'pinned')).toEqual([2, 0])
    expect(at(packed, 'c')).toEqual([0, 1])
  })

  it('preserves input order in the returned array', () => {
    const packed = wrapCompactor.compact(tiles(['c', 2, 0], ['a', 0, 0], ['b', 1, 0]), 3)
    expect(packed.map(l => l.i)).toEqual(['c', 'a', 'b'])
  })
})
