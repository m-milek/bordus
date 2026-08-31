import { SearchBar } from "@/components/SearchBar"

export interface DashboardHeaderProps {
  title?: string
  titleSize?: string
  searchProps?: {
    value: string
    onChange: (value: string) => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    placeholder?: string
  }
}

export const DashboardHeader = ({
  title = "Dashboard",
  titleSize,
  searchProps,
}: DashboardHeaderProps) => {
  return (
    <div className="mb-8 grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
      {/* Left spacer: balances the search column so the title sits centred. */}
      <div className="hidden sm:block" />

      <h1
        className={`justify-self-center text-center font-bold tracking-tight ${titleSize ? "" : "text-3xl"}`}
        style={titleSize ? { fontSize: titleSize } : undefined}
      >
        {title}
      </h1>

      <div className="flex w-full sm:justify-end">
        {searchProps && <SearchBar {...searchProps} />}
      </div>
    </div>
  )
}
