import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { CategoryGrid } from "./CategoryGrid"
import { Category, CategoryPlacement } from "@/lib/config"
import {
  CAT_GAP,
  GAP,
  PAGE_PAD,
  categoryHeightPx,
  cellSize,
  hFromRows,
} from "@/lib/grid"

// jsdom performs no layout, so stand in for the ResizeObserver measurement with
// the widest the grid ever gets: max-w-7xl minus the md:p-12 page padding.
const WIDTH = 1184

vi.mock("react-grid-layout", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-grid-layout")>()
  return {
    ...actual,
    useContainerWidth: () => ({
      width: WIDTH,
      mounted: true,
      containerRef: { current: null },
      measure: () => {},
    }),
  }
})

const CELL = cellSize(WIDTH, 8)

const category = (name: string, count: number): Category => ({
  name,
  color: "blue",
  services: Array.from({ length: count }, (_, i) => ({
    name: `${name}-${i}`,
    url: `http://${name}-${i}.local`,
  })),
})

const tilesFor = (name: string, count: number, width: number) =>
  Array.from({ length: count }, (_, i) => ({
    i: `${name}-${i}`,
    x: i % width,
    y: Math.floor(i / width),
    w: 1,
    h: 1,
  }))

// Each category is filled exactly, so its tiles reach both of its edges.
const setup = (placements: CategoryPlacement[], overrides = {}) => {
  const count = (p: CategoryPlacement) => p.w * p.rows
  const categories = placements.map((p) => category(p.i, count(p)))
  const tiles = Object.fromEntries(
    placements.map((p) => [p.i, { lg: tilesFor(p.i, count(p), p.w) }])
  )
  return render(
    <CategoryGrid
      categories={categories}
      placements={{ lg: placements }}
      tiles={tiles}
      {...overrides}
    />
  )
}

const itemFor = (name: string) =>
  screen.getByText(name).closest(".category-item") as HTMLElement

const cardIn = (item: HTMLElement) =>
  item.querySelector(".category-card") as HTMLElement

describe("CategoryGrid", () => {
  it("gives each category a height of exactly its whole tile rows plus the gap strip", () => {
    setup([
      { i: "Media", x: 0, y: 0, w: 4, rows: 1 },
      { i: "Downloads", x: 4, y: 0, w: 4, rows: 2 },
    ])

    const media = itemFor("Media")
    const downloads = itemFor("Downloads")

    expect(media.style.height).toBe(`${hFromRows(1, CELL)}px`)
    expect(downloads.style.height).toBe(`${hFromRows(2, CELL)}px`)

    // The card fills the item bar the gap strip, so stacked categories are
    // always CAT_GAP apart no matter how tall they are.
    expect(cardIn(media).style.height).toBe(`${categoryHeightPx(1, CELL)}px`)
    expect(
      parseFloat(media.style.height) - parseFloat(cardIn(media).style.height)
    ).toBe(CAT_GAP)
    expect(
      parseFloat(downloads.style.height) -
        parseFloat(cardIn(downloads).style.height)
    ).toBe(CAT_GAP)
  })

  it("places categories on the same column grid the tiles use", () => {
    setup([
      { i: "Media", x: 0, y: 0, w: 4, rows: 1 },
      { i: "Downloads", x: 4, y: 0, w: 4, rows: 1 },
    ])

    const left = (name: string) =>
      parseFloat(
        itemFor(name).style.transform.match(/translate\((-?[\d.]+)px/)![1]
      )

    expect(left("Media")).toBe(PAGE_PAD)
    expect(left("Downloads")).toBe(Math.round(4 * (CELL + GAP) + PAGE_PAD))

    // One gutter between the two categories' item boxes: the coloured frames
    // are drawn into it rather than padding the tiles inward.
    const mediaRight = left("Media") + parseFloat(itemFor("Media").style.width)
    expect(left("Downloads") - mediaRight).toBe(GAP)
  })

  it("does not report an edit just for rendering", () => {
    // The generated layout gets compacted on mount. That must not be mistaken
    // for a user edit, or an untouched dashboard would persist itself and show
    // as customised.
    const onCategoryLayoutChange = vi.fn()
    setup(
      [
        { i: "Media", x: 0, y: 0, w: 4, rows: 1 },
        { i: "Downloads", x: 0, y: 1000, w: 4, rows: 2 },
      ],
      { onCategoryLayoutChange }
    )
    expect(onCategoryLayoutChange).not.toHaveBeenCalled()
  })

  it("keeps one unbroken tile rhythm across a category boundary", () => {
    // The point of spending the gutter on chrome: a tile is GAP from its
    // neighbour whether or not they share a category, with the two frames and
    // the space between them landing evenly inside that gutter.
    setup([
      { i: "Media", x: 0, y: 0, w: 4, rows: 1 },
      { i: "Downloads", x: 4, y: 0, w: 4, rows: 1 },
    ])

    const offset = (el: HTMLElement) =>
      parseFloat(el.style.transform.match(/translate\((-?[\d.]+)px/)![1])
    const span = (tile: string) => {
      const item = screen
        .getByText(tile)
        .closest(".react-grid-item") as HTMLElement
      const left =
        offset(item.closest(".category-item") as HTMLElement) + offset(item)
      return { left, right: left + parseFloat(item.style.width) }
    }

    // Media's rightmost tile to Downloads' leftmost, across two frames.
    expect(span("Downloads-0").left - span("Media-3").right).toBe(GAP)
    // And between two tiles inside Media, which must be indistinguishable.
    expect(span("Media-3").left - span("Media-2").right).toBe(GAP)
  })

  it("hides resize handles until edit mode is on", () => {
    // RGL renders a handle whether or not resizing is enabled, so a locked
    // grid has to opt out or every category shows a grab corner.
    const { container, unmount } = setup([
      { i: "Media", x: 0, y: 0, w: 4, rows: 1 },
    ])
    expect(
      container.querySelectorAll(".react-resizable-handle").length
    ).toBeGreaterThan(0)
    expect(container.querySelector(".grid-locked")).toBeInTheDocument()
    unmount()

    const edit = setup([{ i: "Media", x: 0, y: 0, w: 4, rows: 1 }], {
      isEditMode: true,
    })
    expect(edit.container.querySelector(".grid-locked")).toBeNull()
  })

  it("renders nothing without categories", () => {
    const { container } = render(
      <CategoryGrid categories={[]} placements={{}} tiles={{}} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
