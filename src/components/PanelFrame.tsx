import type { ReactNode } from "react"
import { getCardColorClasses, getPillColorClasses } from "@/lib/colors"
import { CategoryIcon } from "@/components/CategoryIcon"
import { PAD, PILL_HEIGHT, blockSize, categoryHeightPx } from "@/lib/grid"

export interface PanelFrameProps {
  name: string
  color?: string
  icon?: string
  width: number
  rows: number
  cell: number
  isEditMode?: boolean
  children?: ReactNode
}

export const PanelFrame = ({
  name,
  color,
  icon,
  width,
  rows,
  cell,
  isEditMode = false,
  children,
}: PanelFrameProps) => {
  const innerWidth = blockSize(width, cell)

  return (
    <div className="relative h-full w-full">
      <div
        className={`category-card absolute z-0 rounded-[var(--radius)] border shadow-sm ${getCardColorClasses(color)}`}
        style={{
          left: -PAD,
          right: -PAD,
          top: 0,
          height: categoryHeightPx(rows, cell),
        }}
      />

      <div
        className="absolute z-20 -translate-y-1/2"
        style={{ top: 0, left: -PAD + 20, maxWidth: innerWidth + 2 * PAD - 40 }}
      >
        <div
          className={`flex min-w-0 items-center justify-center gap-1.5 rounded-full px-3 ring-1 ring-foreground/[0.07] ${getPillColorClasses(
            color
          )} ${isEditMode ? "category-drag-handle cursor-grab active:cursor-grabbing" : ""}`}
          style={{ height: PILL_HEIGHT }}
        >
          {icon && (
            <CategoryIcon name={icon} className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate text-xs leading-none font-semibold whitespace-nowrap">
            {name}
          </span>
        </div>
      </div>

      {children}
    </div>
  )
}
