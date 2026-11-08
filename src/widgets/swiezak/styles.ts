import type { UpdateLevel } from "@/widgets/swiezak/parse"

export const UPDATE_BADGE_CLASSES: Record<UpdateLevel, string> = {
  major: "bg-red-500/15 text-red-700 dark:text-red-300",
  minor: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  patch: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
}

export const UPDATE_TEXT_CLASSES: Record<UpdateLevel, string> = {
  major: "text-red-600 dark:text-red-300",
  minor: "text-amber-600 dark:text-amber-300",
  patch: "text-sky-600 dark:text-sky-300",
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  "up-to-date": "bg-green-500/15 text-green-700 dark:text-green-300",
  rebuild: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  error: "bg-red-500/15 text-red-700 dark:text-red-300",
  pinned: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

export const statusBadgeClasses = (status: string) =>
  STATUS_BADGE_CLASSES[status] ?? "bg-muted text-muted-foreground"
