import { useCallback } from "react"
import { useWidgetData } from "@/widgets/lib/useWidgetData"
import type { WidgetProps } from "@/widgets/types"
import {
  SwiezakResponseSchema,
  lastCheckedAt,
  toRows,
} from "@/widgets/swiezak/parse"
import { SwiezakRowItem } from "@/widgets/swiezak/SwiezakRowItem"
import { SwiezakSummary } from "@/widgets/swiezak/SwiezakSummary"

export interface SwiezakOptions {
  url: string
  hideNotCheckable: boolean
}

const REFRESH_MS = 5 * 60 * 1000

export const SwiezakWidget = ({ options }: WidgetProps<SwiezakOptions>) => {
  const fetcher = useCallback(async () => {
    const res = await fetch(options.url)
    if (res.status === 503) throw new Error("first check still running")
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const images = SwiezakResponseSchema.parse(await res.json())
    const shown = options.hideNotCheckable
      ? images.filter((image) => image.status !== "not-checkable")
      : images
    return { rows: toRows(shown), checkedAt: lastCheckedAt(shown) }
  }, [options.url, options.hideNotCheckable])
  const { data, error } = useWidgetData(fetcher, REFRESH_MS)

  if (!data) {
    return (
      <div
        className={`flex h-full items-center justify-center p-2 text-center text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}
      >
        {error ? `Couldn't load Swiezak: ${error.message}` : "Loading…"}
      </div>
    )
  }

  return (
    <div className="@container flex h-full flex-col">
      <SwiezakSummary rows={data.rows} checkedAt={data.checkedAt} />
      <ul className="scrollbar-none flex min-h-0 flex-1 flex-col divide-y divide-foreground/[0.06] overflow-y-auto overscroll-contain">
        {data.rows.map((row) => (
          <SwiezakRowItem key={row.key} row={row} />
        ))}
      </ul>
    </div>
  )
}
