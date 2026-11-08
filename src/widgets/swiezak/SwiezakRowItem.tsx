import { ArrowRight } from "lucide-react"
import { HoverPopover } from "@/components/HoverPopover"
import { Badge } from "@/widgets/swiezak/Badge"
import { describeUpdate, formatStatus } from "@/widgets/swiezak/format"
import type { SwiezakRow, UpdateCandidate } from "@/widgets/swiezak/parse"
import {
  UPDATE_TEXT_CLASSES,
  statusBadgeClasses,
} from "@/widgets/swiezak/styles"

interface OtherCandidatesProps {
  candidates: UpdateCandidate[]
}

const OtherCandidates = ({ candidates }: OtherCandidatesProps) => (
  <div className="flex max-w-64 flex-col gap-1.5">
    <span className="text-[11px] font-medium text-muted-foreground">
      Other candidates
    </span>
    <div className="flex flex-wrap gap-x-2.5 gap-y-1 font-mono text-xs">
      {candidates.map((candidate) => (
        <span
          key={`${candidate.level}:${candidate.version}`}
          title={describeUpdate(candidate)}
          className={UPDATE_TEXT_CLASSES[candidate.level]}
        >
          {candidate.version}
        </span>
      ))}
    </div>
  </div>
)

export interface SwiezakRowItemProps {
  row: SwiezakRow
}

export const SwiezakRowItem = ({ row }: SwiezakRowItemProps) => (
  <li className="px-1 py-2">
    <HoverPopover
      content={
        row.otherCandidates.length > 0 && (
          <OtherCandidates candidates={row.otherCandidates} />
        )
      }
      className="flex flex-col gap-1 @xs:flex-row @xs:items-center @xs:gap-3"
    >
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="truncate text-sm font-medium">{row.name}</span>
        <span className="flex shrink-0 items-center gap-1 font-mono text-xs">
          <span className="text-muted-foreground">{row.version}</span>
          {row.update && (
            <>
              <ArrowRight className="h-3 w-3 text-muted-foreground/70" />
              <span
                title={describeUpdate(row.update)}
                className={`font-semibold ${UPDATE_TEXT_CLASSES[row.update.level]}`}
              >
                {row.update.version}
              </span>
            </>
          )}
        </span>
      </div>
      {(!row.update || row.status !== "up-to-date") && (
        <Badge title={row.error} className={statusBadgeClasses(row.status)}>
          {formatStatus(row.status)}
        </Badge>
      )}
    </HoverPopover>
  </li>
)
