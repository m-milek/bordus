import { useState, useEffect } from 'react'
import { Config, loadConfig } from "@/lib/config"
import { DashboardHeader } from "@/components/DashboardHeader"
import { TileGrid } from "@/components/TileGrid"
import { SettingsWidget } from "@/components/SettingsWidget"
import { useFilteredServices } from "@/hooks/useFilteredServices"
import { useGridLayout } from "@/hooks/useGridLayout"

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

  const filteredServices = useFilteredServices(config?.categories, searchQuery)
  const { layouts, onLayoutChange, resetLayout, isCustomized } = useGridLayout(filteredServices)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const firstService = filteredServices?.[0]
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
        <TileGrid 
          services={filteredServices} 
          isEditMode={isEditMode}
          layouts={layouts || undefined}
          onLayoutChange={onLayoutChange}
        />
        <SettingsWidget 
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onResetLayout={resetLayout}
          showResetLayout={isEditMode && isCustomized}
          layouts={layouts || undefined}
        />
      </div>
    </div>
  )
}
