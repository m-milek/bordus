import { ReactNode, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export interface HoverPopoverProps {
  content: ReactNode
  children: ReactNode
  openDelayMs?: number
  className?: string
}

interface Anchor {
  left: number
  top: number
  bottom: number
}

const GAP_PX = 6

export const HoverPopover = ({
  content,
  children,
  openDelayMs = 600,
  className,
}: HoverPopoverProps) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [anchor, setAnchor] = useState<Anchor | null>(null)

  const cancel = () => clearTimeout(timerRef.current)

  const open = () => {
    cancel()
    timerRef.current = setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (rect)
        setAnchor({ left: rect.left, top: rect.top, bottom: rect.bottom })
    }, openDelayMs)
  }

  const close = () => {
    cancel()
    setAnchor(null)
  }

  useEffect(() => {
    if (!anchor) return
    const dismiss = () => setAnchor(null)
    window.addEventListener("scroll", dismiss, true)
    window.addEventListener("resize", dismiss)
    return () => {
      window.removeEventListener("scroll", dismiss, true)
      window.removeEventListener("resize", dismiss)
    }
  }, [anchor])

  useEffect(() => cancel, [])

  const opensUpward = anchor && anchor.bottom > window.innerHeight * 0.7

  return (
    <div
      ref={triggerRef}
      className={className}
      onMouseEnter={open}
      onMouseLeave={close}
    >
      {children}
      {anchor &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[100] animate-in rounded-lg border border-foreground/[0.08] bg-popover px-2.5 py-2 text-popover-foreground shadow-lg duration-150 zoom-in-95 fade-in"
            style={
              opensUpward
                ? {
                    left: anchor.left,
                    bottom: window.innerHeight - anchor.top + GAP_PX,
                  }
                : { left: anchor.left, top: anchor.bottom + GAP_PX }
            }
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  )
}
