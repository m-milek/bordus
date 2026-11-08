import {
  ArrowUp,
  Check,
  LucideIcon,
  RefreshCw,
  TriangleAlert,
} from "lucide-react"
import { Badge } from "@/widgets/swiezak/Badge"
import { formatEuDateTime, plural } from "@/widgets/swiezak/format"
import { SwiezakRow, UPDATE_LEVELS, countImages } from "@/widgets/swiezak/parse"
import {
  UPDATE_BADGE_CLASSES,
  statusBadgeClasses,
} from "@/widgets/swiezak/styles"

interface SummaryChip {
  key: string
  count: number
  title: string
  icon: LucideIcon
  className: string
}

const isUpToDate = (row: SwiezakRow) =>
  !row.update && row.status === "up-to-date"

const summaryChips = (rows: SwiezakRow[]): SummaryChip[] => {
  const countWhere = (predicate: (row: SwiezakRow) => boolean) =>
    countImages(rows.filter(predicate))
  const statusChip = (status: string, label: string, icon: LucideIcon) => {
    const count = countWhere((row) => row.status === status)
    return {
      key: status,
      count,
      title: plural(count, label),
      icon,
      className: statusBadgeClasses(status),
    }
  }
  const upToDate = countWhere(isUpToDate)

  return [
    ...UPDATE_LEVELS.map((level) => {
      const count = countWhere((row) => row.update?.level === level)
      return {
        key: level,
        count,
        title: plural(count, `${level} update`),
        icon: ArrowUp,
        className: UPDATE_BADGE_CLASSES[level],
      }
    }),
    statusChip("rebuild", "rebuild", RefreshCw),
    statusChip("error", "error", TriangleAlert),
    {
      key: "up-to-date",
      count: upToDate,
      title: `${upToDate} up to date`,
      icon: Check,
      className: statusBadgeClasses("up-to-date"),
    },
  ].filter((chip) => chip.count > 0)
}

export interface SwiezakSummaryProps {
  rows: SwiezakRow[]
  checkedAt?: string
}

export const SwiezakSummary = ({ rows, checkedAt }: SwiezakSummaryProps) => {
  const chips = summaryChips(rows)

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1 px-1 py-2 text-xs text-muted-foreground">
      {chips.length ? (
        chips.map(({ key, count, title, icon, className }) => (
          <Badge key={key} title={title} icon={icon} className={className}>
            {count}
          </Badge>
        ))
      ) : (
        <Badge
          title="All up to date"
          icon={Check}
          className={statusBadgeClasses("up-to-date")}
        >
          All up to date
        </Badge>
      )}
      <span className="ml-auto opacity-60">
        {plural(countImages(rows), "image")}
        {checkedAt && ` · ${formatEuDateTime(new Date(checkedAt))}`}
      </span>
    </div>
  )
}
