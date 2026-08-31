import { cloneLayoutItem, sortLayoutItemsByRowCol } from 'react-grid-layout/core'
import type { Compactor, Layout, LayoutItem } from 'react-grid-layout/core'

/**
 * Packs a layout densely in reading order, the way text wraps.
 *
 * The compactors that ship with react-grid-layout only ever slide an item along
 * one axis, so dropping a tile onto an occupied slot pushes the occupant down
 * and strands it on a row of its own -- a category of three tiles in three
 * columns grows a second row the moment you reorder it. This one instead
 * re-flows every tile into the first slot that fits, scanning left to right and
 * top to bottom, so a reorder is just a reorder: no gaps open up, and no row
 * appears unless the tiles genuinely need one.
 *
 * Items are visited in their current visual order, which is what makes a drag
 * read as an insertion at the position you dropped on.
 */
const fits = (occupied: boolean[][], x: number, y: number, w: number, h: number) => {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      if (occupied[row]?.[col]) return false
    }
  }
  return true
}

const occupy = (occupied: boolean[][], x: number, y: number, w: number, h: number) => {
  for (let row = y; row < y + h; row++) {
    occupied[row] ??= []
    for (let col = x; col < x + w; col++) occupied[row][col] = true
  }
}

const firstFreeSlot = (occupied: boolean[][], cols: number, item: LayoutItem) => {
  const w = Math.min(item.w, cols)
  for (let y = 0; ; y++) {
    for (let x = 0; x + w <= cols; x++) {
      if (fits(occupied, x, y, w, item.h)) return { x, y, w }
    }
  }
}

export const wrapCompactor: Compactor = {
  type: 'wrap',
  allowOverlap: false,
  compact(layout: Layout, cols: number): Layout {
    const occupied: boolean[][] = []
    const out = new Array<LayoutItem>(layout.length)

    // Static items hold their given position; everything else flows around them.
    for (const item of layout) {
      if (!item.static) continue
      occupy(occupied, item.x, item.y, item.w, item.h)
      out[layout.indexOf(item)] = cloneLayoutItem(item)
    }

    for (const sortedItem of sortLayoutItemsByRowCol(layout)) {
      if (sortedItem.static) continue
      const placed = cloneLayoutItem(sortedItem)
      const { x, y, w } = firstFreeSlot(occupied, cols, placed)
      placed.x = x
      placed.y = y
      placed.w = w
      placed.moved = false
      occupy(occupied, x, y, w, placed.h)
      out[layout.indexOf(sortedItem)] = placed
    }

    return out
  }
}
