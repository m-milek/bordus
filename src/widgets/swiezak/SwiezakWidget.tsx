import { ReactNode, useCallback } from "react"
import { ArrowUp } from "lucide-react"
import { useWidgetData } from "@/widgets/lib/useWidgetData"
import type { WidgetProps } from "@/widgets/types"
import {
  SwiezakResponseSchema,
  SwiezakRow,
  UpdateLevel,
  lastCheckedAt,
  toRows,
} from "@/widgets/swiezak/parse"

export interface SwiezakOptions {
  url: string
  hideNotCheckable: boolean
}

const REFRESH_MS = 5 * 60 * 1000

const UPDATE_CLASSES: Record<UpdateLevel, string> = {
  major: "bg-red-500/15 text-red-700 dark:text-red-300",
  minor: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  patch: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
}

const STATUS_CLASSES: Record<string, string> = {
  "up-to-date": "bg-green-500/15 text-green-700 dark:text-green-300",
  rebuild: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  error: "bg-red-500/15 text-red-700 dark:text-red-300",
}

interface BadgeProps {
  className: string
  title?: string
  children: ReactNode
}

const Badge = ({ className, title, children }: BadgeProps) => (
  <span
    title={title}
    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-none font-medium whitespace-nowrap ${className}`}
  >
    {children}
  </span>
)

interface SwiezakRowItemProps {
  row: SwiezakRow
}

const SwiezakRowItem = ({ row }: SwiezakRowItemProps) => (
  <li className="flex flex-col gap-1 rounded-md bg-card/60 px-2.5 py-2 @xs:flex-row @xs:items-center @xs:gap-3">
    <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
      <span className="truncate text-sm font-medium" title={row.name}>
        {row.name}
      </span>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">
        {row.version}
      </span>
    </div>
    <div className="flex flex-wrap gap-1">
      {row.update && (
        <Badge
          title={`${row.update.level} update to ${row.update.version}`}
          className={`pl-0.5 ${UPDATE_CLASSES[row.update.level]}`}
        >
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-current">
            <ArrowUp className="h-2.5 w-2.5 text-background" strokeWidth={3} />
          </span>
          {row.update.version}
        </Badge>
      )}
      {(!row.update || row.status !== "up-to-date") && (
        <Badge
          title={row.error}
          className={
            STATUS_CLASSES[row.status] ?? "bg-muted text-muted-foreground"
          }
        >
          {row.status}
        </Badge>
      )}
    </div>
  </li>
)

interface SwiezakSummaryProps {
  rows: SwiezakRow[]
  checkedAt?: string
}

const SwiezakSummary = ({ rows, checkedAt }: SwiezakSummaryProps) => {
  const updates = rows.filter((r) => r.update).length
  const rebuilds = rows.filter((r) => r.status === "rebuild").length
  const errors = rows.filter((r) => r.status === "error").length
  const parts = [
    updates && `${updates} update${updates === 1 ? "" : "s"}`,
    rebuilds && `${rebuilds} rebuild${rebuilds === 1 ? "" : "s"}`,
    errors && `${errors} error${errors === 1 ? "" : "s"}`,
  ].filter(Boolean)

  return (
    <div className="shrink-0 px-1 pb-2 text-xs text-muted-foreground">
      {parts.length ? parts.join(" · ") : "All up to date"}
      <span className="opacity-60">
        {" "}
        / {rows.length} images
        {checkedAt &&
          ` · checked ${new Date(checkedAt).toLocaleString(undefined, {
            dateStyle: "short",
            timeStyle: "short",
          })}`}
      </span>
    </div>
  )
}

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
      <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain scrollbar-none">
        {data.rows.map((row) => (
          <SwiezakRowItem key={row.key} row={row} />
        ))}
      </ul>
    </div>
  )
}
