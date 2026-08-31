import {
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  type LayoutConstraint,
} from "react-grid-layout/core"

/**
 * Every pixel measurement in the dashboard grid, in one place.
 *
 * One rule drives all of it: a tile is `cell` pixels square and sits exactly
 * `GAP` pixels from the next tile in every direction -- whether or not the two
 * tiles belong to the same category.
 */

/** The floating title pill; it straddles the top border of its card. */
export const PILL_HEIGHT = 24

/**
 * Space between a card's border and its tiles, on every side. Half the pill
 * height, so the pill's overhang below the border exactly fills the top inset.
 */
export const PAD = PILL_HEIGHT / 2

/**
 * Visible gap between two stacked category cards. Kept a few pixels larger than
 * `PAD` so the next card's title pill -- which overhangs its own top border by
 * `PAD` -- clears the bottom border of the card above instead of touching it.
 */
export const CAT_GAP = 16

/**
 * The gutter between tiles: the grid `margin`, used unchanged inside a category
 * and between categories.
 *
 * A category's grid item is exactly as wide as its block of tiles, so the card
 * is drawn `PAD` pixels *outward* past the item on each side instead of
 * insetting the tiles. Two tiles in neighbouring categories are then
 * `PAD` + `CAT_GAP` + `PAD` apart -- so defining `GAP` as that sum makes a
 * cross-category gap identical to the plain margin between two tiles in one
 * category.
 */
export const GAP = PAD + CAT_GAP + PAD

/** Inset between the page edge and the outermost tiles. */
export const PAGE_PAD = 12

/*
 * Each column count takes over at the width where it starts producing tiles of
 * a usable size, rather than at a round number borrowed from a device. Solving
 * `container = cols * (cell + GAP) - PAGE_PAD * 2` for a cell between 110 and
 * 160 px gives the ranges these thresholds sit at the bottom of, which keeps a
 * tile inside that band at every width -- including just above a threshold,
 * where tiles are at their smallest.
 */
export const BREAKPOINTS = {
  lg: 1150,
  md: 860,
  sm: 570,
  xs: 430,
  xxs: 0,
} as const
export const COLS = { lg: 8, md: 6, sm: 4, xs: 3, xxs: 2 } as const

export type BreakpointName = keyof typeof COLS

export const BREAKPOINT_NAMES: BreakpointName[] = [
  "lg",
  "md",
  "sm",
  "xs",
  "xxs",
]

export const breakpointForWidth = (width: number): BreakpointName =>
  getBreakpointFromWidth(BREAKPOINTS, width)

export const colsForWidth = (width: number): number =>
  getColsFromBreakpoint(breakpointForWidth(width), COLS)

/** Cell size that fills `containerWidth` with `cols` columns and their gutters. */
export const cellSize = (containerWidth: number, cols: number): number =>
  (containerWidth - GAP * (cols - 1) - PAGE_PAD * 2) / cols

/** Pixel span of `n` cells and the `n - 1` gutters between them. */
export const blockSize = (n: number, cell: number): number =>
  n * cell + (n - 1) * GAP

/**
 * Height of a category's outer-grid item, for a category `rows` tiles tall.
 *
 * It comes out to a whole number of tile pitches (`cell + GAP`): a card spends
 * `PAD` above its tiles, `PAD` below them, and `CAT_GAP` on the strip beneath
 * the card -- and `PAD + PAD + CAT_GAP` is `GAP`, exactly one pitch of chrome
 * per row. The outer grid runs a vertical margin of 0, so that strip has to be
 * part of the item height rather than a margin.
 */
export const hFromRows = (rows: number, cell: number): number =>
  Math.round(rows * (cell + GAP))

/** Visible card height: the grid item less the `CAT_GAP` strip beneath it. */
export const categoryHeightPx = (rows: number, cell: number): number =>
  hFromRows(rows, cell) - CAT_GAP

/** Inverse of `hFromRows`: the whole tile-row count closest to `h`. */
export const rowsFromH = (h: number, cell: number): number =>
  Math.max(1, Math.round(h / (cell + GAP)))

/**
 * Holds a category's height to a whole tile-row count while its resize handle
 * is dragged, so it snaps live instead of jumping back on release.
 */
export const wholeTileRows = (cell: number): LayoutConstraint => ({
  name: "wholeTileRows",
  constrainSize: (_item, w, h) => ({
    w,
    h: hFromRows(rowsFromH(h, cell), cell),
  }),
})
