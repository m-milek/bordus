import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import fixture from "@/test/fixtures/swiezak-response.json"
import live from "@/test/fixtures/swiezak-live.json"
import { SwiezakWidget } from "@/widgets/swiezak/SwiezakWidget"
import { formatEuDateTime } from "@/widgets/swiezak/format"
import {
  SwiezakResponseSchema,
  parseImageRef,
  toRows,
} from "@/widgets/swiezak/parse"

const renderWidget = (hideNotCheckable = false) =>
  render(
    <SwiezakWidget
      options={{ url: "http://swiezak.local/api/v1/docker", hideNotCheckable }}
      width={300}
      height={300}
      isEditMode={false}
    />
  )

const mockFetch = (response: Response) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(response)

afterEach(() => {
  vi.restoreAllMocks()
})

describe("parseImageRef", () => {
  it.each([
    ["postgres:17", "postgres", "17"],
    ["traefik/whoami:v1.10", "traefik/whoami", "v1.10"],
    ["ghcr.io/m-milek/bordus:0.0.1", "ghcr.io/m-milek/bordus", "0.0.1"],
    [
      "docker.io/library/alpine:3.20@sha256:d9e853e87e55526f6b2917df91a2115c36dd7c696a35be12163d44e6e2a4b6bc",
      "alpine",
      "3.20",
    ],
    [
      "mysql@sha256:3819b2b23835c4a73c8b022fafc33c8095c0f81c929a8b7a84613d2fba6c52f5",
      "mysql",
      "@3819b2b",
    ],
    ["registry.local:5000/app", "registry.local:5000/app", "latest"],
    ["julescraft-server", "julescraft-server", "latest"],
    [
      "sha256:d9e853e87e55526f6b2917df91a2115c36dd7c696a35be12163d44e6e2a4b6bc",
      "d9e853e87e55",
      "untagged",
    ],
  ])("%s", (image, name, version) => {
    expect(parseImageRef(image)).toEqual({ name, version })
  })
})

describe("toRows", () => {
  it("picks the most significant newest update and sorts updates first", () => {
    const rows = toRows(SwiezakResponseSchema.parse(fixture))
    expect(rows.map((r) => [r.name, r.update?.version])).toEqual([
      ["postgres", "18"],
      ["alpine", "3.24"],
      ["alpine", "3.24"],
      ["traefik/whoami", "v1.12"],
      ["nginx", undefined],
      ["julescraft-server", undefined],
      ["mysql", undefined],
      ["ghcr.io/m-milek/bordus", undefined],
    ])
  })
})

describe("formatEuDateTime", () => {
  it("formats as day.month.year with a 24-hour clock", () => {
    expect(formatEuDateTime(new Date(2026, 10, 8, 18, 5))).toBe(
      "08.11.2026 18:05"
    )
  })
})

describe("toRows candidates", () => {
  it("keeps every version after the headline update as another candidate", () => {
    const [row] = toRows(
      SwiezakResponseSchema.parse([
        {
          image: "alpine:3.20",
          pinned: false,
          status: "up-to-date",
          minor: ["3.24", "3.23"],
          patch: ["3.20.9"],
        },
      ])
    )
    expect(row.update).toEqual({ level: "minor", version: "3.24" })
    expect(row.otherCandidates).toEqual([
      { level: "minor", version: "3.23" },
      { level: "patch", version: "3.20.9" },
    ])
  })
})

describe("toRows deduplication", () => {
  it("merges images that resolve to the same row and counts them", () => {
    const image = {
      pinned: false,
      status: "up-to-date",
      minor: ["3.24"],
    }
    const rows = toRows(
      SwiezakResponseSchema.parse([
        { ...image, image: "alpine:3.20" },
        { ...image, image: "docker.io/library/alpine:3.20" },
        { ...image, image: "alpine:3.21" },
      ])
    )
    expect(rows.map((r) => [r.name, r.version, r.count])).toEqual([
      ["alpine", "3.20", 2],
      ["alpine", "3.21", 1],
    ])
  })
})

describe("SwiezakResponseSchema", () => {
  it("accepts a live response that omits empty version lists", () => {
    const images = SwiezakResponseSchema.parse(live)
    expect(images).toHaveLength(live.length)
    expect(images[0]).toMatchObject({ major: [], minor: [], patch: [] })
  })
})

describe("SwiezakWidget", () => {
  it("shows a summary and every image from the response", async () => {
    mockFetch(Response.json(fixture))
    renderWidget()

    expect(await screen.findByTitle("1 major update")).toHaveTextContent("1")
    expect(screen.getByTitle("3 minor updates")).toHaveTextContent("3")
    expect(screen.getByTitle("2 rebuilds")).toHaveTextContent("2")
    expect(screen.getByTitle("1 error")).toHaveTextContent("1")
    expect(screen.getByTitle("1 up to date")).toHaveTextContent("1")
    expect(screen.getAllByText("Up to date").length).toBeGreaterThan(0)
    expect(screen.getByTitle("major update to 18")).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(fixture.length)
  })

  it("can hide images swiezak cannot check", async () => {
    mockFetch(Response.json(fixture))
    renderWidget(true)

    expect(await screen.findByTitle("major update to 18")).toBeInTheDocument()
    expect(screen.queryByText("Not checkable")).toBeNull()
    expect(screen.getAllByRole("listitem")).toHaveLength(
      fixture.filter((image) => image.status !== "not-checkable").length
    )
  })

  it("explains a 503 while swiezak runs its first check", async () => {
    mockFetch(new Response("report not ready yet", { status: 503 }))
    renderWidget()

    expect(
      await screen.findByText(
        "Couldn't load Swiezak: first check still running"
      )
    ).toBeInTheDocument()
  })
})
