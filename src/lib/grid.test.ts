import { describe, it, expect } from "vitest"
import {
  CAT_GAP,
  GAP,
  PAD,
  PAGE_PAD,
  PILL_HEIGHT,
  blockSize,
  breakpointForWidth,
  categoryHeightPx,
  cellSize,
  colsForWidth,
  hFromRows,
  rowsFromH,
  wholeTileRows,
} from "./grid"

describe("cellSize", () => {
  it("spends the container on cells, gutters and the page padding alone", () => {
    const containerWidth = 1184
    const cols = 8
    const expected = (containerWidth - GAP * (cols - 1) - PAGE_PAD * 2) / cols
    expect(cellSize(containerWidth, cols)).toBe(expected)
    expect(cellSize(containerWidth, cols)).toBeCloseTo(110, 5)
  })

  it("leaves no leftover width once gutters and padding are accounted for", () => {
    const containerWidth = 900
    const cols = 6
    const cell = cellSize(containerWidth, cols)
    expect(PAGE_PAD * 2 + blockSize(cols, cell)).toBeCloseTo(containerWidth, 10)
  })
})

describe("the gutter budget", () => {
  it("pads a category equally on all four sides", () => {
    // The top gets no extra: the pill straddles the border, so its overhang is
    // exactly the top padding rather than something added on top of it.
    expect(PAD).toBe(PILL_HEIGHT / 2)
  })

  it("splits evenly between the two frames it holds and the space between them", () => {
    // A category's frame is drawn into the gutter rather than padding its tiles
    // inward, so this is what keeps a tile the same distance from its neighbour
    // whether or not they share a category.
    expect(2 * PAD + CAT_GAP).toBe(GAP)
    expect(CAT_GAP).toBeGreaterThan(0)
  })
})

describe("blockSize", () => {
  it("counts one fewer gutter than cells", () => {
    expect(blockSize(1, 100)).toBe(100)
    expect(blockSize(2, 100)).toBe(200 + GAP)
    expect(blockSize(4, 134.5)).toBe(4 * 134.5 + 3 * GAP)
  })
})

describe("hFromRows / rowsFromH", () => {
  const cells = [96, 120, 134.5, 150, 183.333]

  it("round-trips every row count", () => {
    for (const cell of cells) {
      for (let rows = 1; rows <= 10; rows++) {
        expect(rowsFromH(hFromRows(rows, cell), cell)).toBe(rows)
      }
    }
  })

  it("snaps an in-between height to the nearest whole row", () => {
    const cell = 134.5
    const two = hFromRows(2, cell)
    const three = hFromRows(3, cell)
    expect(rowsFromH(two + 4, cell)).toBe(2)
    expect(rowsFromH(three - 4, cell)).toBe(3)
    expect(rowsFromH(Math.round((two + three) / 2) - 1, cell)).toBe(2)
  })

  it("never returns fewer than one row", () => {
    expect(rowsFromH(0, 134.5)).toBe(1)
    expect(rowsFromH(-500, 134.5)).toBe(1)
  })

  it("leaves exactly the card height plus the gap strip", () => {
    const cell = 134.5
    const rows = 3
    expect(hFromRows(rows, cell)).toBe(
      Math.round(categoryHeightPx(rows, cell) + CAT_GAP)
    )
  })
})

describe("wholeTileRows constraint", () => {
  it("snaps a proposed height to a valid row count and leaves width alone", () => {
    const cell = 134.5
    const { constrainSize } = wholeTileRows(cell)
    const item = { i: "Media", x: 0, y: 0, w: 4, h: 100 }
    const proposed = hFromRows(2, cell) + 30

    const result = constrainSize!(item, 4, proposed, "se", {
      cols: 8,
      maxRows: Infinity,
    } as never)

    expect(result.w).toBe(4)
    expect(result.h).toBe(hFromRows(2, cell))
    expect(rowsFromH(result.h, cell)).toBe(2)
  })
})

describe("breakpointForWidth / colsForWidth", () => {
  it("makes the 8-column layout reachable at the real container width", () => {
    // max-w-7xl (1280) minus md:p-12 (2 x 48) is the widest the grid ever gets.
    expect(breakpointForWidth(1184)).toBe("lg")
    expect(colsForWidth(1184)).toBe(8)
  })

  it("keeps tiles a usable size at every width, thresholds included", () => {
    /*
     * Tiles are smallest just above a threshold, where the column count has
     * gone up but the container has not, so walking every width is what catches
     * a threshold that hands a phone too many columns.
     *
     * The bounds are deliberately lopsided. Going from two columns to three is
     * a 50% step, and at phone widths there is no threshold that avoids both
     * overshooting on two and undershooting on three -- so the floor is strict
     * and the ceiling is loose. An oversized tile on a phone is a big tap
     * target; an undersized one is the illegible label this ladder exists to
     * prevent.
     */
    const tooSmall: string[] = []
    const tooLarge: string[] = []

    for (let width = 300; width <= 1184; width++) {
      const cell = cellSize(width, colsForWidth(width))
      if (cell < 105) tooSmall.push(`${width}px -> ${cell.toFixed(0)}px`)
      if (cell > 190) tooLarge.push(`${width}px -> ${cell.toFixed(0)}px`)
    }

    expect(tooSmall).toEqual([])
    expect(tooLarge).toEqual([])
  })

  it("switches breakpoint strictly above the threshold", () => {
    expect(breakpointForWidth(1151)).toBe("lg")
    expect(breakpointForWidth(1150)).toBe("md")
    expect(breakpointForWidth(861)).toBe("md")
    expect(breakpointForWidth(860)).toBe("sm")
    expect(breakpointForWidth(571)).toBe("sm")
    expect(breakpointForWidth(431)).toBe("xs")
    expect(breakpointForWidth(430)).toBe("xxs")
  })

  it("gives a phone two columns rather than three", () => {
    // A 390px phone leaves a 358px container after the page padding.
    expect(colsForWidth(358)).toBe(2)
    expect(cellSize(358, 2)).toBeCloseTo(147, 0)
  })
})
