import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import fixture from "@/test/fixtures/swiezak-response.json"
import live from "@/test/fixtures/swiezak-live.json"
import { SwiezakWidget } from "@/widgets/swiezak/SwiezakWidget"
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

    expect(
      await screen.findByText("4 updates · 2 rebuilds · 1 error")
    ).toBeInTheDocument()
    expect(screen.getByTitle("major update to 18")).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(fixture.length)
  })

  it("can hide images swiezak cannot check", async () => {
    mockFetch(Response.json(fixture))
    renderWidget(true)

    expect(await screen.findByTitle("major update to 18")).toBeInTheDocument()
    expect(screen.queryByText("not-checkable")).toBeNull()
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
