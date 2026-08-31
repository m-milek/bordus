import { useState, useEffect } from 'react'
import { Config, loadConfig } from "@/lib/config"
import { DashboardHeader } from "@/components/DashboardHeader"
import { CategoryGrid } from "@/components/CategoryGrid"
import { SearchResultsGrid } from "@/components/SearchResultsGrid"
import { SettingsWidget } from "@/components/SettingsWidget"
import { useFilteredServices } from "@/hooks/useFilteredServices"
import { useDashboardLayout } from "@/hooks/useDashboardLayout"

export const App = () => {
  const [config, setConfig] = useState<Config | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Use state to throw async errors into the React render cycle
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadConfig()
      .then(setConfig)
      .catch(setError)
  }, [])

  // Throw to ErrorBoundary
  if (error) {
    throw error
  }

  const isSearching = searchQuery.trim() !== ''
  const searchResults = useFilteredServices(config?.categories, searchQuery)
  const {
    layout,
    isCustomized,
    onCategoryLayoutChange,
    onTileLayoutChange,
    resetLayout
  } = useDashboardLayout(config?.categories, config?.gridLayout)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const firstService = searchResults?.[0]
      if (firstService?.url) {
        window.open(firstService.url, '_blank')
        setSearchQuery('')
      }
    }
  }

  if (!config) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>

  const paddingClass = 'p-4 sm:p-8 md:p-12'
  const appStyle = config.font ? { fontFamily: config.font } : undefined

  return (
    <div className={`min-h-screen bg-background text-foreground font-sans ${paddingClass} transition-colors duration-300`} style={appStyle}>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title={config?.title} 
          titleSize={config?.titleSize} 
          searchProps={config?.search ? {
            value: searchQuery,
            onChange: setSearchQuery,
            onKeyDown: handleSearchKeyDown,
            placeholder: config.searchPrompt
          } : undefined}
        />
        {isSearching ? (
          <SearchResultsGrid services={searchResults} />
        ) : (
          <CategoryGrid
            categories={config.categories}
            placements={layout.categories}
            tiles={layout.tiles}
            isEditMode={isEditMode}
            onCategoryLayoutChange={onCategoryLayoutChange}
            onTileLayoutChange={onTileLayoutChange}
          />
        )}
        <SettingsWidget 
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onResetLayout={resetLayout}
          showResetLayout={isEditMode && isCustomized}
          layout={layout}
        />
      </div>
    </div>
  )
}
