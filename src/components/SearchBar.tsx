import { Search } from 'lucide-react'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const SearchBar = ({ value, onChange, onKeyDown }: SearchBarProps) => {
  return (
    <div className="mb-10 relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input 
        autoFocus
        type="text" 
        placeholder="Search services..." 
        className="w-full p-3 pl-10 rounded-md bg-muted text-foreground border-none outline-none shadow-sm focus:ring-2 focus:ring-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
