import type { UpdateCandidate } from "@/widgets/swiezak/parse"

export const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1).replaceAll("-", " ")

const pad = (value: number) => String(value).padStart(2, "0")

export const formatEuDateTime = (date: Date) =>
  `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`

export const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

export const describeUpdate = ({ level, version }: UpdateCandidate) =>
  `${level} update to ${version}`
