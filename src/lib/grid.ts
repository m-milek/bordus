import {
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  type LayoutConstraint,
} from 'react-grid-layout/core'

/**
 * Single source of truth for every pixel measurement in the dashboard grid.
 *
 * The whole layout hangs off one invariant: a tile is always `cell` pixels
 * square and always separated from its neighbours by exactly `GAP`, no matter
 * which category it lives in or how wide that category is. Everything below
 * exists to preserve that.
 */

/** Height of the floating title pill. */
export const PILL_HEIGHT = 24
/**
 * Padding between a category's frame and the tiles inside it, on all four
 * sides.
 *
 * Equal to half the pill's height, which is what makes the padding uniform: the
 * pill straddles the top border, so its overhang fills the top padding exactly
 * and the tiles clear it by the same margin the frame gives them everywhere
 * else. Equivalently, this is how far the card is drawn past its grid item box.
 */
export const PAD = PILL_HEIGHT / 2
/** Gap between two categories, on both axes. */
export const CAT_GAP = 12
/**
 * Gutter between tiles.
 *
 * Derived, because it is the entire budget for a category's chrome. A
 * category's item box is exactly as wide as the block of tiles inside it, so
 * its card has to be drawn *outward* into the gutter rather than padding the
 * tiles inward -- fitting `w` tile columns into `w * cell + (w - 1) * GAP - 2P`
 * yields a tile size of `cell - 2P / w`, which only equals `cell` when the
 * padding is zero. The gutter therefore has to cover both neighbouring frames
 * and the space between them, and in return a tile sits exactly `GAP` from its
 * neighbour whether or not they share a category.
 */
export const GAP = 2 * PAD + CAT_GAP
/** Padding between the page container and the outermost grid items. */
export const PAGE_PAD = 12
/** Row height of the outer grid, in pixels. */
export const ROW_UNIT = 1

export const BREAKPOINTS = { lg: 1100, md: 768, sm: 480, xs: 360, xxs: 0 } as const
export const COLS = { lg: 8, md: 6, sm: 4, xs: 3, xxs: 3 } as const

export type BreakpointName = keyof typeof COLS

export const BREAKPOINT_NAMES: BreakpointName[] = ['lg', 'md', 'sm', 'xs', 'xxs']

/**
 * Constant part of the item height. It works out to zero -- a category's item
 * is exactly `rows` tile pitches tall -- because the gutter it gives back to
 * the page is precisely the chrome it spends above and below its tiles.
 */
const HEIGHT_OFFSET = PAD + PAD + CAT_GAP - GAP

export const breakpointForWidth = (width: number): BreakpointName =>
  getBreakpointFromWidth(BREAKPOINTS, width)

export const colsForWidth = (width: number): number =>
  getColsFromBreakpoint(breakpointForWidth(width), COLS)

/**
 * Width (or height) of a single grid cell.
 *
 * One formula for the whole page, so every tile is the same size no matter
 * which category it sits in.
 */
export const cellSize = (containerWidth: number, cols: number): number =>
  (containerWidth - GAP * (cols - 1) - PAGE_PAD * 2) / cols

/** Span of `n` cells including the gutters between them. */
export const blockSize = (n: number, cell: number): number => n * cell + (n - 1) * GAP

/**
 * Height of a category's grid item, in `ROW_UNIT`s.
 *
 * Affine in `rows`, which is what makes `rowsFromH` an exact inverse.
 */
export const hFromRows = (rows: number, cell: number): number =>
  Math.round((rows * (cell + GAP) + HEIGHT_OFFSET) / ROW_UNIT)

/**
 * Visible height of a category's card: its grid item less the gap strip.
 *
 * Derived from the item height rather than summed from HEADER, the tile block
 * and CHROME, so that the gap between stacked cards is exactly `CAT_GAP` even
 * when a fractional cell size makes the item height round. The rounding
 * lands in the card's bottom padding instead, where half a pixel is invisible.
 */
export const categoryHeightPx = (rows: number, cell: number): number =>
  hFromRows(rows, cell) * ROW_UNIT - CAT_GAP

/** Inverse of `hFromRows`: the whole number of tile rows closest to `h`. */
export const rowsFromH = (h: number, cell: number): number =>
  Math.max(1, Math.round((h * ROW_UNIT - HEIGHT_OFFSET) / (cell + GAP)))

/**
 * Constrains a category's height to a whole number of tile rows while the
 * resize handle is being dragged, so it snaps live rather than jumping back
 * on release.
 */
export const wholeTileRows = (cell: number): LayoutConstraint => ({
  name: 'wholeTileRows',
  constrainSize: (_item, w, h) => ({ w, h: hFromRows(rowsFromH(h, cell), cell) }),
})
