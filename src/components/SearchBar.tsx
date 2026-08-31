import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
}

export const SearchBar = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "Search services...",
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [modifierKey] = useState(() => {
    if (typeof navigator !== "undefined") {
      const isMac =
        navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
        navigator.userAgent.toUpperCase().indexOf("MAC") >= 0
      return isMac ? "⌘" : "Ctrl"
    }
    return "⌘"
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    const handleWindowFocus = () => {
      inputRef.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("focus", handleWindowFocus)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("focus", handleWindowFocus)
    }
  }, [])

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        autoFocus
        type="search"
        placeholder={placeholder}
        className="w-full rounded-md border-none bg-muted p-2 pr-12 pl-9 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        onKeyDown={onKeyDown}
      />
      <div className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-1 sm:flex">
        <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 shadow-sm">
          <span className="text-xs">{modifierKey}</span>K
        </kbd>
      </div>
    </div>
  )
}
