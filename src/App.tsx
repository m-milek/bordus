import { useState } from 'react'
import { Config } from "@/lib/config"
import { DashboardHeader } from "@/components/DashboardHeader"
import { ErrorBanner } from "@/components/ErrorBanner"
import { SearchBar } from "@/components/SearchBar"
import { SectionGrid } from "@/components/SectionGrid"
import { useFilteredCategories } from "@/hooks/useFilteredCategories"

export interface AppProps {
  config: Config | null
  error: string | null
}

export const App = ({ config, error }: AppProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const filteredCategories = useFilteredCategories(config?.categories, searchQuery)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const firstService = filteredCategories?.[0]?.services?.[0]
      if (firstService?.url) {
        window.open(firstService.url, '_blank')
        setSearchQuery('')
      }
    }
  }

  const appStyle = config?.font ? { fontFamily: config.font } : undefined

  return (
    <div className="bg-background text-foreground min-h-screen p-8" style={appStyle}>
      <div className="max-w-5xl mx-auto">
        <DashboardHeader title={config?.title} titleSize={config?.titleSize} />
        {error && <ErrorBanner error={error} />}
        {config?.search && <SearchBar value={searchQuery} onChange={setSearchQuery} onKeyDown={handleSearchKeyDown} />}
        <SectionGrid categories={filteredCategories} columns={config?.layout?.columns} />
      </div>
    </div>
  )
}
