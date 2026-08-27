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
  title = 'Dashboard', 
  titleSize, 
  searchProps
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
      <h1 
        className={`font-bold tracking-tight ${titleSize ? '' : 'text-3xl'}`}
        style={titleSize ? { fontSize: titleSize } : undefined}
      >
        {title}
      </h1>
      
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {searchProps && (
          <div className="w-full sm:w-64">
            <SearchBar {...searchProps} />
          </div>
        )}
      </div>
    </div>
  )
}
