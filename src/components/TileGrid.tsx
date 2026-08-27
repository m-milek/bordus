import { Service } from "@/lib/config"
import { Tile } from "@/components/Tile"
import { Responsive, WidthProvider, ResponsiveLayouts, Layout } from "react-grid-layout/legacy"
import { useState, useRef, useEffect } from "react"
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

export interface TileGridProps {
  services?: Service[]
  isEditMode?: boolean
  layouts?: ResponsiveLayouts
  onLayoutChange?: (currentLayout: Layout, allLayouts: ResponsiveLayouts) => void
}

export const TileGrid = ({ services, isEditMode = false, layouts, onLayoutChange }: TileGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(1200)
  const [currentCols, setCurrentCols] = useState(8)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  if (!services || services.length === 0) return null

  const handleLayoutChange = (layout: Layout, allLayouts: ResponsiveLayouts) => {
    if (onLayoutChange) {
      onLayoutChange(layout, allLayouts)
    }
  }

  const handleBreakpointChange = (_: string, cols: number) => {
    setCurrentCols(cols)
  }

  const margin = 12
  const containerPadding = 12
  const colWidth = (containerWidth - (margin * (currentCols - 1)) - (containerPadding * 2)) / currentCols
  const dynamicRowHeight = colWidth > 0 ? colWidth : 150

  return (
    <div ref={containerRef} className="w-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 768, sm: 480, xs: 360, xxs: 0 }}
        cols={{ lg: 8, md: 6, sm: 4, xs: 3, xxs: 3 }}
        rowHeight={dynamicRowHeight}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".drag-handle"
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={handleBreakpointChange}
        compactType="vertical"
        margin={[margin, margin]}
        containerPadding={[containerPadding, containerPadding]}
        useCSSTransforms={true}
      >
      {services.map((service) => (
        <div key={service.name} className="relative group/tile">
          {isEditMode && (
            <div className="absolute top-2 right-2 z-20 drag-handle cursor-grab active:cursor-grabbing p-1.5 rounded-md bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-foreground/70 transition-colors backdrop-blur-md opacity-0 group-hover/tile:opacity-100">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M5.5 3C4.67157 3 4 3.67157 4 4.5C4 5.32843 4.67157 6 5.5 6C6.32843 6 7 5.32843 7 4.5C7 3.67157 6.32843 3 5.5 3ZM5.5 5C5.22386 5 5 4.77614 5 4.5C5 4.22386 5.22386 4 5.5 4C5.77614 4 6 4.22386 6 4.5C6 4.77614 5.77614 5 5.5 5ZM9.5 3C8.67157 3 8 3.67157 8 4.5C8 5.32843 8.67157 6 9.5 6C10.3284 6 11 5.32843 11 4.5C11 3.67157 10.3284 3 9.5 3ZM9.5 5C9.22386 5 9 4.77614 9 4.5C9 4.22386 9.22386 4 9.5 4C9.77614 4 10 4.22386 10 4.5C10 4.77614 9.77614 5 9.5 5ZM5.5 7C4.67157 7 4 7.67157 4 8.5C4 9.32843 4.67157 10 5.5 10C6.32843 10 7 9.32843 7 8.5C7 7.67157 6.32843 7 5.5 7ZM5.5 9C5.22386 9 5 8.77614 5 8.5C5 8.22386 5.22386 8 5.5 8C5.77614 8 6 8.22386 6 8.5C6 8.77614 5.77614 9 5.5 9ZM9.5 7C8.67157 7 8 7.67157 8 8.5C8 9.32843 8.67157 10 9.5 10C10.3284 10 11 9.32843 11 8.5C11 7.67157 10.3284 7 9.5 7ZM9.5 9C9.22386 9 9 8.77614 9 8.5C9 8.22386 9.22386 8 9.5 8C9.77614 8 10 8.22386 10 8.5C10 8.77614 9.77614 9 9.5 9ZM5.5 11C4.67157 11 4 11.6715 4 12.5C4 13.3284 4.67157 14 5.5 14C6.32843 14 7 13.3284 7 12.5C7 11.6715 6.32843 11 5.5 11ZM5.5 13C5.22386 13 5 12.7761 5 12.5C5 12.2239 5.22386 12 5.5 12C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13ZM9.5 11C8.67157 11 8 11.6715 8 12.5C8 13.3284 8.67157 14 9.5 14C10.3284 14 11 13.3284 11 12.5C11 11.6715 10.3284 11 9.5 11ZM9.5 13C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12C9.77614 12 10 12.2239 10 12.5C10 12.7761 9.77614 13 9.5 13Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </div>
          )}
          <Tile service={service} />
        </div>
      ))}
      </ResponsiveGridLayout>
    </div>
  )
}
