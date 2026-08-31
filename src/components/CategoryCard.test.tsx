import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { CategoryCard } from "./CategoryCard"
import { Category, TilePlacement } from "@/lib/config"
import { GAP, PAD, blockSize, categoryHeightPx } from "@/lib/grid"

const CELL = 134.5
const PITCH = CELL + GAP

const service = (name: string) => ({ name, url: `http://${name}.local` })

const category = (count: number): Category => ({
  name: "Media",
  color: "blue",
  icon: "play",
  services: Array.from({ length: count }, (_, i) => service(`svc-${i}`)),
})

const grid = (count: number, width: number): TilePlacement[] =>
  Array.from({ length: count }, (_, i) => ({
    i: `svc-${i}`,
    x: i % width,
    y: Math.floor(i / width),
    w: 1,
    h: 1,
  }))

const tileFor = (name: string) =>
  screen.getByText(name).closest(".react-grid-item") as HTMLElement

/**
 * A fractional cell size cannot land on whole pixels, so react-grid-layout
 * rounds each item's offset and then trims its width until the gutter is
 * exactly `margin` wide. These tests assert the invariants that survive that
 * rounding -- offsets, gutters and the block's outer edge -- which is what
 * "tiles stay on the same grid" actually means in pixels.
 */
const box = (element: HTMLElement) => {
  const [, left] =
    element.style.transform.match(/translate\((-?[\d.]+)px,(-?[\d.]+)px\)/) ??
    []
  const [, , top] =
    element.style.transform.match(/translate\((-?[\d.]+)px,(-?[\d.]+)px\)/) ??
    []
  return {
    left: parseFloat(left),
    top: parseFloat(top),
    width: parseFloat(element.style.width),
    height: parseFloat(element.style.height),
  }
}

describe("CategoryCard geometry", () => {
  it("places tiles at the offsets the page-wide grid pitch dictates", () => {
    render(
      <CategoryCard
        category={category(6)}
        width={4}
        rows={2}
        cell={CELL}
        tiles={grid(6, 4)}
      />
    )

    // No padding is stolen by the category's chrome: offsets are purely the
    // cell index times the pitch, exactly as on the original flat grid.
    for (let i = 0; i < 6; i++) {
      const { left, top, width, height } = box(tileFor(`svc-${i}`))
      expect(left).toBe(Math.round((i % 4) * PITCH))
      expect(top).toBe(Math.round(Math.floor(i / 4) * PITCH))
      // Rounding a fractional cell can shift a side by a pixel, never more.
      expect(Math.abs(width - CELL)).toBeLessThanOrEqual(1)
      expect(Math.abs(height - CELL)).toBeLessThanOrEqual(1)
    }
  })

  it("leaves exactly one gutter between tiles and none at the block edges", () => {
    render(
      <CategoryCard
        category={category(4)}
        width={4}
        rows={1}
        cell={CELL}
        tiles={grid(4, 4)}
      />
    )

    const cells = [0, 1, 2, 3].map((i) => box(tileFor(`svc-${i}`)))
    expect(cells[0].left).toBe(0)
    for (let i = 1; i < cells.length; i++) {
      expect(cells[i].left - (cells[i - 1].left + cells[i - 1].width)).toBe(GAP)
    }
    // The block's right edge meets the category's item box, so the chrome sits
    // in the page gutter rather than pushing tiles inward.
    const last = cells[3]
    expect(last.left + last.width).toBe(Math.round(blockSize(4, CELL)))
  })

  it("keeps the same cell size and column boundaries whatever the category width", () => {
    const { unmount } = render(
      <CategoryCard
        category={category(2)}
        width={2}
        rows={1}
        cell={CELL}
        tiles={grid(2, 2)}
      />
    )
    const narrow = [0, 1].map((i) => box(tileFor(`svc-${i}`)))
    unmount()

    render(
      <CategoryCard
        category={category(2)}
        width={6}
        rows={1}
        cell={CELL}
        tiles={grid(2, 6)}
      />
    )
    const wide = [0, 1].map((i) => box(tileFor(`svc-${i}`)))

    expect(wide).toEqual(narrow)
    expect(Math.abs(narrow[0].width - CELL)).toBeLessThanOrEqual(1)
  })

  it("sizes the tile block to the grid item box, and the card to overhang it", () => {
    const { container } = render(
      <CategoryCard
        category={category(4)}
        width={4}
        rows={2}
        cell={CELL}
        tiles={grid(4, 4)}
      />
    )

    const body = container.querySelector(".category-body") as HTMLElement
    expect(body.style.height).toBe(`${blockSize(2, CELL)}px`)
    expect(body.style.left).toBe("0px")
    expect(body.style.right).toBe("0px")
    expect(body.style.top).toBe(`${PAD}px`)

    const card = container.firstElementChild?.firstElementChild as HTMLElement
    expect(card.style.height).toBe(`${categoryHeightPx(2, CELL)}px`)
    expect(card.style.left).toBe(`${-PAD}px`)
    expect(card.style.right).toBe(`${-PAD}px`)
  })

  it("offers one snap stop per hidden row, the last at the maximum scroll offset", () => {
    // 9 tiles across 4 columns is 3 rows of content in a 2-row viewport.
    const { container } = render(
      <CategoryCard
        category={category(9)}
        width={4}
        rows={2}
        cell={CELL}
        tiles={grid(9, 4)}
      />
    )

    const stops = Array.from(
      container.querySelectorAll<HTMLElement>(
        '.category-body > [aria-hidden="true"]'
      )
    ).map((node) => parseFloat(node.style.top))

    expect(stops).toEqual([0, PITCH])
    expect(stops.at(-1)).toBe(blockSize(3, CELL) - blockSize(2, CELL))
  })

  it("does not scroll at all when every tile already fits", () => {
    const { container } = render(
      <CategoryCard
        category={category(4)}
        width={4}
        rows={2}
        cell={CELL}
        tiles={grid(4, 4)}
      />
    )

    const body = container.querySelector(".category-body") as HTMLElement
    expect(body).toHaveClass("overflow-y-hidden")
    expect(body).not.toHaveClass("overflow-y-auto")
    expect(body.style.scrollSnapType).toBe("")
    expect(
      container.querySelectorAll('.category-body > [aria-hidden="true"]')
    ).toHaveLength(0)
    expect(container.querySelector('[title$="more rows"]')).toBeNull()
  })

  it("signals the hidden rows outside the tile viewport, so no tile looks clipped", () => {
    const { container } = render(
      <CategoryCard
        category={category(9)}
        width={4}
        rows={2}
        cell={CELL}
        tiles={grid(9, 4)}
      />
    )

    const hint = container.querySelector<HTMLElement>('[title="1 more row"]')!
    expect(hint).toBeInTheDocument()
    // It sits in the card's footer band, below the scrolling area entirely.
    expect(parseFloat(hint.style.top)).toBe(PAD + blockSize(2, CELL))
    expect(container.querySelector(".category-body")).not.toContainElement(hint)
  })

  it("turns snapping off in edit mode so it cannot fight a tile drag", () => {
    const { container } = render(
      <CategoryCard
        category={category(9)}
        width={4}
        rows={2}
        cell={CELL}
        tiles={grid(9, 4)}
        isEditMode
      />
    )

    const body = container.querySelector(".category-body") as HTMLElement
    expect(body.style.scrollSnapType).toBe("")
    expect(
      container.querySelectorAll('.category-body > [aria-hidden="true"]')
    ).toHaveLength(0)
    expect(container.querySelector(".category-drag-handle")).toBeInTheDocument()
  })

  it("reorders a full row in place instead of spilling onto a new one", () => {
    // The shape a drag leaves behind: 'c' dropped onto 'a', which the stock
    // compactor would resolve by stranding 'a' on a second row.
    const three: Category = {
      name: "Media",
      services: ["one", "two", "three"].map((n) => ({
        name: n,
        url: `http://${n}.local`,
      })),
    }
    const { container } = render(
      <CategoryCard
        category={three}
        width={3}
        rows={1}
        cell={CELL}
        tiles={[
          { i: "three", x: 0, y: 0, w: 1, h: 1 },
          { i: "one", x: 0, y: 0, w: 1, h: 1 },
          { i: "two", x: 1, y: 0, w: 1, h: 1 },
        ]}
      />
    )

    const cells = ["one", "two", "three"].map((n) => box(tileFor(n)))
    expect(cells.map((c) => c.top)).toEqual([0, 0, 0])
    // 'three' takes the vacated slot and the other two shift along.
    expect(box(tileFor("three")).left).toBe(0)
    expect(box(tileFor("one")).left).toBe(Math.round(PITCH))
    expect(box(tileFor("two")).left).toBe(Math.round(2 * PITCH))
    // One row means nothing to scroll, so no hint and no snapping either.
    expect(container.querySelector('[title$="more rows"]')).toBeNull()
  })

  it("renders the title pill with the category icon", () => {
    render(
      <CategoryCard
        category={category(2)}
        width={4}
        rows={1}
        cell={CELL}
        tiles={grid(2, 4)}
      />
    )
    expect(screen.getByText("Media")).toBeInTheDocument()
  })
})
