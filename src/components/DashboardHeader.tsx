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
    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 mb-8">
      {/* Empty div for flex/grid spacing to perfectly center the title */}
      <div className="hidden sm:block"></div>
      
      <h1 
        className={`font-bold tracking-tight text-center justify-self-center ${titleSize ? '' : 'text-3xl'}`}
        style={titleSize ? { fontSize: titleSize } : undefined}
      >
        {title}
      </h1>
      
      <div className="flex items-center sm:justify-end w-full">
        {searchProps && (
          <div className="w-full sm:w-64">
            <SearchBar {...searchProps} />
          </div>
        )}
      </div>
    </div>
  )
}
