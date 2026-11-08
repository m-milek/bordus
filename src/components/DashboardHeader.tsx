import type { ReactNode } from "react"
import { SearchBar, type SearchBarProps } from "@/components/SearchBar"

export interface DashboardHeaderProps {
  title?: string
  titleSize?: string
  searchProps?: SearchBarProps
  actions?: ReactNode
}

export const DashboardHeader = ({
  title = "Dashboard",
  titleSize,
  searchProps,
  actions,
}: DashboardHeaderProps) => (
  <header className="mb-10 grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-4 px-1 lg:grid-cols-[1fr_minmax(0,26rem)_1fr]">
    <div className="min-w-0">
      <h1
        className={`truncate font-bold tracking-tight ${titleSize ? "" : "text-3xl"}`}
        style={titleSize ? { fontSize: titleSize } : undefined}
      >
        {title}
      </h1>
    </div>

    {searchProps && (
      <div className="col-span-2 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
        <SearchBar {...searchProps} />
      </div>
    )}

    <div className="col-start-2 row-start-1 flex justify-end lg:col-start-3">
      {actions}
    </div>
  </header>
)
