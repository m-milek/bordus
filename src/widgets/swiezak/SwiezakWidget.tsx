import { ReactNode, useCallback } from "react"
import {
  ArrowUp,
  Check,
  LucideIcon,
  RefreshCw,
  TriangleAlert,
} from "lucide-react"
import { useWidgetData } from "@/widgets/lib/useWidgetData"
import type { WidgetProps } from "@/widgets/types"
import {
  SwiezakResponseSchema,
  SwiezakRow,
  UpdateLevel,
  lastCheckedAt,
  toRows,
} from "@/widgets/swiezak/parse"
import {
  formatEuDateTime,
  formatStatus,
  plural,
} from "@/widgets/swiezak/format"

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
  pinned: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
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

interface CircleIconProps {
  icon: LucideIcon
}

const CircleIcon = ({ icon: Icon }: CircleIconProps) => (
  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-current">
    <Icon className="h-2.5 w-2.5 text-background" strokeWidth={3} />
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
          <CircleIcon icon={ArrowUp} />
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
          {formatStatus(row.status)}
        </Badge>
      )}
    </div>
  </li>
)

interface SummaryChip {
  key: string
  count: number
  label: string
  icon: LucideIcon
  className: string
}

const summaryChips = (rows: SwiezakRow[]): SummaryChip[] => {
  const countUpdates = (level: UpdateLevel) =>
    rows.filter((row) => row.update?.level === level).length
  const countStatus = (status: string) =>
    rows.filter((row) => row.status === status).length
  const chips = [
    ...(["major", "minor", "patch"] as const).map((level) => ({
      key: level,
      count: countUpdates(level),
      label: `${level} update`,
      icon: ArrowUp,
      className: UPDATE_CLASSES[level],
    })),
    {
      key: "rebuild",
      count: countStatus("rebuild"),
      label: "rebuild",
      icon: RefreshCw,
      className: STATUS_CLASSES.rebuild,
    },
    {
      key: "error",
      count: countStatus("error"),
      label: "error",
      icon: TriangleAlert,
      className: STATUS_CLASSES.error,
    },
    {
      key: "up-to-date",
      count: rows.filter((row) => !row.update && row.status === "up-to-date")
        .length,
      label: "up to date",
      icon: Check,
      className: STATUS_CLASSES["up-to-date"],
    },
  ]
  return chips.filter((chip) => chip.count > 0)
}

interface SwiezakSummaryProps {
  rows: SwiezakRow[]
  checkedAt?: string
}

const SwiezakSummary = ({ rows, checkedAt }: SwiezakSummaryProps) => {
  const chips = summaryChips(rows)

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1 px-1 pt-2 pb-2 text-xs text-muted-foreground">
      {chips.length ? (
        chips.map(({ key, count, label, icon, className }) => (
          <Badge
            key={key}
            title={
              key === "up-to-date" ? `${count} ${label}` : plural(count, label)
            }
            className={`pl-0.5 ${className}`}
          >
            <CircleIcon icon={icon} />
            {count}
          </Badge>
        ))
      ) : (
        <Badge
          title="All up to date"
          className={`pl-0.5 ${STATUS_CLASSES["up-to-date"]}`}
        >
          <CircleIcon icon={Check} />
          All up to date
        </Badge>
      )}
      <span className="ml-auto opacity-60">
        {plural(rows.length, "image")}
        {checkedAt && ` · ${formatEuDateTime(new Date(checkedAt))}`}
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
      <ul className="scrollbar-none flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain">
        {data.rows.map((row) => (
          <SwiezakRowItem key={row.key} row={row} />
        ))}
      </ul>
    </div>
  )
}
