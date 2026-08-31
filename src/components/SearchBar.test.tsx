import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SearchBar } from "./SearchBar"

describe("SearchBar Component", () => {
  it("renders with placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} />)
    expect(
      screen.getByPlaceholderText("Search services...")
    ).toBeInTheDocument()
  })

  it("calls onChange when user types", () => {
    const handleChange = vi.fn()
    render(<SearchBar value="" onChange={handleChange} />)

    const input = screen.getByPlaceholderText("Search services...")
    fireEvent.change(input, { target: { value: "plex" } })

    expect(handleChange).toHaveBeenCalledWith("plex")
  })

  it("calls onKeyDown when enter is pressed", () => {
    const handleKeyDown = vi.fn()
    render(
      <SearchBar
        value="search text"
        onChange={() => {}}
        onKeyDown={handleKeyDown}
      />
    )

    const input = screen.getByPlaceholderText("Search services...")
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(handleKeyDown).toHaveBeenCalled()
  })
})
