import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { parseConfig } from "@/lib/config"
import { useDashboardLayout } from "@/hooks/useDashboardLayout"

vi.mock("@/widgets/registry", async () => {
  const { z } = await import("zod")
  return {
    WIDGETS: {
      test: {
        optionsSchema: z.object({
          url: z.string().url(),
          intervalMs: z.number().default(30000),
        }),
        component: () => null,
      },
    },
  }
})

beforeEach(() => {
  localStorage.clear()
})

describe("widget config", () => {
  it("validates options against the integration schema and applies defaults", () => {
    const config = parseConfig(`
widgets:
  - type: test
    name: Updates
    options:
      url: http://updates.local
`)
    expect(config.widgets?.[0].options).toEqual({
      url: "http://updates.local",
      intervalMs: 30000,
    })
  })

  it("reports invalid options under the widget's options path", () => {
    expect(() =>
      parseConfig(`
widgets:
  - type: test
    name: Updates
    options:
      url: nope
`)
    ).toThrow(/Invalid URL/)
  })

  it("rejects unknown widget types", () => {
    expect(() =>
      parseConfig(`
widgets:
  - type: missing
    name: Updates
`)
    ).toThrow(/"type"/)
  })
})

describe("widget layout", () => {
  it("places widgets after categories at a default size", () => {
    const config = parseConfig(`
categories:
  - name: Media
    services:
      - name: Plex
        url: http://plex.local
widgets:
  - type: test
    name: Updates
    options:
      url: http://updates.local
`)
    const { result } = renderHook(() =>
      useDashboardLayout(config.categories, config.gridLayout, config.widgets)
    )
    expect(result.current.layout.categories.lg).toEqual([
      { i: "Media", x: 0, y: 0, w: 4, rows: 1 },
      { i: "Updates", x: 4, y: 0, w: 2, rows: 2 },
    ])
    expect(result.current.layout.tiles.Updates).toBeUndefined()
  })
})
