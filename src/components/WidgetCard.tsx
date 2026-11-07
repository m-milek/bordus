import { Widget } from "@/lib/config"
import { PAD, blockSize } from "@/lib/grid"
import { PanelFrame } from "@/components/PanelFrame"
import { WIDGETS } from "@/widgets/registry"

export interface WidgetCardProps {
  widget: Widget
  width: number
  rows: number
  cell: number
  isEditMode?: boolean
}

export const WidgetCard = ({
  widget,
  width,
  rows,
  cell,
  isEditMode = false,
}: WidgetCardProps) => {
  const Component = WIDGETS[widget.type].component
  const height = blockSize(rows, cell)

  return (
    <PanelFrame
      name={widget.name}
      color={widget.color}
      icon={widget.icon}
      width={width}
      rows={rows}
      cell={cell}
      isEditMode={isEditMode}
    >
      <div
        className="category-body absolute z-10 overflow-hidden"
        style={{ left: 0, right: 0, top: PAD, height }}
      >
        <Component
          options={widget.options}
          width={blockSize(width, cell)}
          height={height}
          isEditMode={isEditMode}
        />
      </div>
    </PanelFrame>
  )
}
