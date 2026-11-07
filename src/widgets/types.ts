import type { ComponentType } from "react"
import type { z } from "zod"

export interface WidgetProps<Options = unknown> {
  options: Options
  width: number
  height: number
  isEditMode: boolean
}

export interface WidgetDefinition<Options = unknown> {
  optionsSchema: z.ZodType<Options>
  component: ComponentType<WidgetProps<Options>>
}

export const defineWidget = <Options>(
  definition: WidgetDefinition<Options>
): WidgetDefinition<Options> => definition
