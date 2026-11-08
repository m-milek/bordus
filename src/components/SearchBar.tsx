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
    <div className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        autoFocus
        type="search"
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-foreground/[0.08] bg-card/50 pr-14 pl-10 text-sm text-foreground shadow-sm transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/15 [&::-webkit-search-cancel-button]:hidden"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        onKeyDown={onKeyDown}
      />
      <div className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center gap-1 sm:flex">
        <kbd className="inline-flex h-5 items-center gap-0.5 rounded-md border border-foreground/[0.08] px-1.5 font-sans text-[11px] font-medium text-muted-foreground">
          <span className="text-xs">{modifierKey}</span>K
        </kbd>
      </div>
    </div>
  )
}
