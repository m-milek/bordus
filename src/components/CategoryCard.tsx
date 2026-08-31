import { useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { GridLayout, type Layout } from "react-grid-layout"
import { Category, TilePlacement } from "@/lib/config"
import { getColorClasses, getSolidColorClasses } from "@/lib/colors"
import { CategoryIcon } from "@/components/CategoryIcon"
import { DragHandle } from "@/components/DragHandle"
import { Tile } from "@/components/Tile"
import { GAP, PAD, PILL_HEIGHT, blockSize, categoryHeightPx } from "@/lib/grid"
import { wrapCompactor } from "@/lib/wrapCompactor"

export interface CategoryCardProps {
  category: Category
  /** Width of the category in tile columns. */
  width: number
  /** Visible tile rows; anything past this scrolls. */
  rows: number
  /** Pixel size of one grid cell, shared with every other category. */
  cell: number
  tiles: TilePlacement[]
  isEditMode?: boolean
  onTilesChange?: (placements: TilePlacement[]) => void
}

const toTilePlacements = (layout: Layout): TilePlacement[] =>
  layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))

export const CategoryCard = ({
  category,
  width,
  rows,
  cell,
  tiles,
  isEditMode = false,
  onTilesChange
}: CategoryCardProps) => {
  // Tiles take their tint from the category, matching the card's own colour.
  const services = useMemo(
    () =>
      new Map(
        category.services.map(service => [
          service.name,
          { ...service, categoryName: category.name, categoryColor: category.color }
        ])
      ),
    [category.services, category.name, category.color]
  )

  const placed = useMemo(
    () => tiles.filter(tile => services.has(tile.i)),
    [tiles, services]
  )

  // The tile block is exactly as wide as the category's grid item box, which is
  // what keeps tiles on the page-wide grid: no padding is subtracted first.
  const innerWidth = blockSize(width, cell)
  const totalRows = Math.max(rows, ...placed.map(tile => tile.y + tile.h), 1)
  const viewportHeight = blockSize(rows, cell)
  const isScrollable = totalRows > rows
  const canScroll = isScrollable && !isEditMode

  const layout = useMemo<Layout>(
    () =>
      placed.map(tile => ({ ...tile, minW: 1, minH: 1, maxW: width, maxH: totalRows })),
    [placed, width, totalRows]
  )

  // Only a finished drag or resize is an edit; see CategoryGrid.
  const handleGestureEnd = (next: Layout) => {
    onTilesChange?.(toTilePlacements(next))
  }

  return (
    <div className="relative h-full w-full">
      <div
        className={`category-card absolute z-0 rounded-[var(--radius)] border-2 ${getColorClasses(category.color)}`}
        style={{
          left: -PAD,
          right: -PAD,
          top: 0,
          height: categoryHeightPx(rows, cell)
        }}
      />

      <div
        className="absolute z-20 -translate-y-1/2"
        style={{ top: 0, left: 20 - PAD }}
      >
        <div
          className={`flex items-center justify-center gap-1.5 rounded-full px-3 shadow-sm ${getSolidColorClasses(
            category.color
          )} ${isEditMode ? "category-drag-handle cursor-grab active:cursor-grabbing" : ""}`}
          // The card's top band is sized from this, so it cannot be left to
          // whatever the text and padding happen to add up to.
          style={{ height: PILL_HEIGHT }}
        >
          {category.icon && <CategoryIcon name={category.icon} className="h-3.5 w-3.5 shrink-0" />}
          <span className="text-xs leading-none font-semibold whitespace-nowrap">
            {category.name}
          </span>
        </div>
      </div>

      <div
        className={`category-body absolute z-10 overflow-x-hidden ${
          // Nothing to scroll to when every tile is already on screen.
          isScrollable ? "overflow-y-auto overscroll-contain" : "overflow-y-hidden"
        }`}
        style={{
          left: 0,
          right: 0,
          top: PAD,
          height: viewportHeight,
          // Mandatory snapping would fight a tile drag, so it is off while editing.
          scrollSnapType: canScroll ? "y mandatory" : undefined
        }}
      >
        {/*
          Invisible snap targets, one per whole tile row. The viewport is
          blockSize(rows) tall and the content blockSize(totalRows), so the
          maximum scroll offset is exactly (totalRows - rows) * (cell + GAP) --
          the last stop below. Every resting position therefore shows whole
          tiles only.
        */}
        {canScroll &&
          Array.from({ length: totalRows - rows + 1 }, (_, k) => (
            <div
              key={k}
              aria-hidden="true"
              className="pointer-events-none absolute h-px w-px"
              style={{ top: k * (cell + GAP), scrollSnapAlign: "start" }}
            />
          ))}

        <GridLayout
          width={innerWidth}
          layout={layout}
          gridConfig={{
            cols: width,
            rowHeight: cell,
            margin: [GAP, GAP],
            containerPadding: [0, 0]
          }}
          // Tiles flow in reading order, so reordering shifts its neighbours
          // along rather than pushing one onto a row of its own.
          compactor={wrapCompactor}
          dragConfig={{ enabled: isEditMode, handle: ".drag-handle" }}
          resizeConfig={{ enabled: isEditMode }}
          onDragStop={handleGestureEnd}
          onResizeStop={handleGestureEnd}
        >
          {placed.map(tile => {
            const service = services.get(tile.i)!
            return (
              <div key={tile.i} className="group/tile relative">
                {isEditMode && (
                  <DragHandle className="absolute top-2 right-2 z-20 bg-black/10 opacity-0 backdrop-blur-md group-hover/tile:opacity-100 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20" />
                )}
                <Tile service={service} />
              </div>
            )
          })}
        </GridLayout>
      </div>

      {isScrollable && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 flex items-end justify-center text-muted-foreground"
          style={{ left: 0, right: 0, top: PAD + viewportHeight, height: PAD }}
          title={`${totalRows - rows} more row${totalRows - rows === 1 ? "" : "s"}`}
        >
          <ChevronDown className="h-3 w-3" />
        </div>
      )}
    </div>
  )
}
