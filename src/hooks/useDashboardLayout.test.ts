import { describe, it, expect, beforeEach } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useDashboardLayout } from "./useDashboardLayout"
import { Category, DashboardLayout } from "@/lib/config"

const STORAGE_KEY = "bordus-grid-layout"

const services = (count: number, prefix = "svc") =>
  Array.from({ length: count }, (_, i) => ({
    name: `${prefix}-${i}`,
    url: `http://${prefix}-${i}.local`,
  }))

const categories = (...counts: number[]): Category[] =>
  counts.map((count, i) => ({
    name: `cat-${i}`,
    services: services(count, `cat-${i}-svc`),
  }))

const render = (cats: Category[], configLayout?: DashboardLayout) =>
  renderHook(() => useDashboardLayout(cats, configLayout))

beforeEach(() => {
  localStorage.clear()
})

describe("useDashboardLayout defaults", () => {
  it("sizes categories per breakpoint and packs them across the columns", () => {
    const { result } = render(categories(4, 4))
    const { lg, md, sm } = result.current.layout.categories

    expect(lg).toEqual([
      { i: "cat-0", x: 0, y: 0, w: 4, rows: 1 },
      { i: "cat-1", x: 4, y: 0, w: 4, rows: 1 },
    ])
    // Six columns fit two three-wide categories.
    expect(md?.map((p) => [p.x, p.w])).toEqual([
      [0, 3],
      [3, 3],
    ])
    // Four columns fit one, so the second wraps to a new row.
    expect(sm?.map((p) => [p.x, p.y])).toEqual([
      [0, 0],
      [0, 1000],
    ])
  })

  it("derives visible rows from the service count, capped so tall categories scroll", () => {
    const { result } = render(categories(4, 8, 40))
    expect(result.current.layout.categories.lg?.map((p) => p.rows)).toEqual([
      1, 2, 3,
    ])
  })

  it("lays tiles out row-major within the category width", () => {
    const { result } = render(categories(6))
    expect(
      result.current.layout.tiles["cat-0"].lg?.map((t) => [t.x, t.y])
    ).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [0, 1],
      [1, 1],
    ])
    // Narrower breakpoint, narrower category, so the same tiles wrap sooner.
    expect(
      result.current.layout.tiles["cat-0"].xs?.map((t) => [t.x, t.y])
    ).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ])
  })
})

describe("useDashboardLayout precedence", () => {
  it("honours w and rows from the category config", () => {
    const cats = categories(6)
    cats[0].w = 6
    cats[0].rows = 1

    const { result } = render(cats)
    expect(result.current.layout.categories.lg?.[0]).toMatchObject({
      w: 6,
      rows: 1,
    })
    // Six columns of tiles, so the sixth tile stays on the first row.
    expect(result.current.layout.tiles["cat-0"].lg?.[5]).toMatchObject({
      x: 5,
      y: 0,
    })
  })

  it("lets a per-breakpoint layout override the category-wide keys", () => {
    const cats = categories(6)
    cats[0].w = 6
    cats[0].layout = { md: { w: 2, rows: 3 } }

    const { result } = render(cats)
    expect(result.current.layout.categories.lg?.[0]).toMatchObject({ w: 6 })
    expect(result.current.layout.categories.md?.[0]).toMatchObject({
      w: 2,
      rows: 3,
    })
  })

  it("clamps a width past the breakpoint to the columns available", () => {
    const cats = categories(3)
    cats[0].w = 12

    const { result } = render(cats)
    expect(result.current.layout.categories.lg?.[0].w).toBe(8)
    expect(result.current.layout.categories.xs?.[0].w).toBe(3)
  })

  it("applies a gridLayout block from the config over the defaults", () => {
    const { result } = render(categories(4, 4), {
      categories: { lg: [{ i: "cat-1", x: 0, y: 5, w: 2, rows: 3 }] },
    })

    expect(result.current.layout.categories.lg).toEqual([
      { i: "cat-0", x: 0, y: 0, w: 4, rows: 1 },
      { i: "cat-1", x: 0, y: 5, w: 2, rows: 3 },
    ])
    expect(result.current.isCustomized).toBe(false)
  })

  it("prefers a saved layout over the config block", () => {
    const cats = categories(4, 4)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        hash: "cat-0:cat-0-svc-0,cat-0-svc-1,cat-0-svc-2,cat-0-svc-3|cat-1:cat-1-svc-0,cat-1-svc-1,cat-1-svc-2,cat-1-svc-3|v14",
        layout: {
          categories: { lg: [{ i: "cat-0", x: 4, y: 9, w: 1, rows: 4 }] },
        },
      })
    )

    const { result } = render(cats, {
      categories: { lg: [{ i: "cat-0", x: 0, y: 0, w: 2, rows: 2 }] },
    })

    expect(result.current.layout.categories.lg?.[0]).toEqual({
      i: "cat-0",
      x: 4,
      y: 9,
      w: 1,
      rows: 4,
    })
    expect(result.current.isCustomized).toBe(true)
  })

  it("discards a saved layout from an earlier version or a changed config", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        hash: "cat-0|v13",
        layout: { lg: [{ i: "cat-0", x: 7, y: 0, w: 1, h: 1 }] },
      })
    )

    const { result } = render(categories(4))
    expect(result.current.isCustomized).toBe(false)
    expect(result.current.layout.categories.lg?.[0]).toMatchObject({
      x: 0,
      w: 4,
    })
  })

  it("drops saved entries for categories and services that no longer exist", () => {
    const cats = categories(2)
    const { result } = render(cats, {
      categories: { lg: [{ i: "ghost", x: 0, y: 0, w: 1, rows: 1 }] },
      tiles: { ghost: { lg: [{ i: "nobody", x: 0, y: 0, w: 1, h: 1 }] } },
    })

    expect(result.current.layout.categories.lg?.map((p) => p.i)).toEqual([
      "cat-0",
    ])
    expect(result.current.layout.tiles.ghost).toBeUndefined()
  })
})

describe("useDashboardLayout persistence", () => {
  it("persists a category change and marks the layout customised", () => {
    const { result } = render(categories(4))

    act(() => {
      result.current.onCategoryLayoutChange("lg", [
        { i: "cat-0", x: 2, y: 0, w: 3, rows: 2 },
      ])
    })

    expect(result.current.isCustomized).toBe(true)
    expect(result.current.layout.categories.lg?.[0].rows).toBe(2)
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.layout.categories.lg[0]).toEqual({
      i: "cat-0",
      x: 2,
      y: 0,
      w: 3,
      rows: 2,
    })
  })

  it("persists a tile change under its category and breakpoint only", () => {
    const { result } = render(categories(2))

    act(() => {
      result.current.onTileLayoutChange("cat-0", "lg", [
        { i: "cat-0-svc-0", x: 3, y: 1, w: 1, h: 1 },
        { i: "cat-0-svc-1", x: 0, y: 0, w: 2, h: 2 },
      ])
    })

    expect(result.current.layout.tiles["cat-0"].lg?.[1]).toMatchObject({
      w: 2,
      h: 2,
    })
    // Other breakpoints keep their generated layout.
    expect(result.current.layout.tiles["cat-0"].md?.[1]).toMatchObject({
      w: 1,
      h: 1,
    })
  })

  it("resets back to the config layout and clears storage", () => {
    const { result } = render(categories(4), {
      categories: { lg: [{ i: "cat-0", x: 1, y: 0, w: 2, rows: 2 }] },
    })

    act(() => {
      result.current.onCategoryLayoutChange("lg", [
        { i: "cat-0", x: 6, y: 0, w: 1, rows: 1 },
      ])
    })
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

    act(() => {
      result.current.resetLayout()
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(result.current.isCustomized).toBe(false)
    expect(result.current.layout.categories.lg?.[0]).toEqual({
      i: "cat-0",
      x: 1,
      y: 0,
      w: 2,
      rows: 2,
    })
  })
})
