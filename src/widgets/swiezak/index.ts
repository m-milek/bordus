import { z } from "zod"
import { defineWidget } from "@/widgets/types"
import { SwiezakWidget } from "@/widgets/swiezak/SwiezakWidget"

export const swiezak = defineWidget({
  optionsSchema: z.object({
    url: z.string().url(),
    hideNotCheckable: z.boolean().default(false),
  }),
  component: SwiezakWidget,
})
