import { useState } from 'react'
import { Config } from "@/lib/config"
import { DashboardHeader } from "@/components/DashboardHeader"
import { ErrorBanner } from "@/components/ErrorBanner"
import { CategoryGrid } from "@/components/CategoryGrid"
import { SettingsWidget } from "@/components/SettingsWidget"
import { useFilteredCategories } from "@/hooks/useFilteredCategories"
import { useGridLayout } from "@/hooks/useGridLayout"

export interface AppProps {
  config: Config | null
  error: string | null
}

export const App = ({ config: initialConfig, error }: AppProps) => {
  const config = initialConfig
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  
  const filteredCategories = useFilteredCategories(config?.categories, searchQuery)
  const { layouts, onLayoutChange, resetLayout, isCustomized } = useGridLayout(config?.categories, config?.gridLayout)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const firstService = filteredCategories?.[0]?.services?.[0]
      if (firstService?.url) {
        window.open(firstService.url, '_blank')
        setSearchQuery('')
      }
    }
  }

  if (!config) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>

  const paddingMap = {
    small: 'p-2 sm:p-4',
    medium: 'p-4 sm:p-8 md:p-12',
    large: 'p-8 sm:p-16 md:p-24'
  }
  const paddingClass = paddingMap[config.layout?.padding || 'medium']
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
        {error && <ErrorBanner error={error} />}
        <CategoryGrid 
          categories={filteredCategories} 
          layout={config?.layout} 
          isEditMode={isEditMode}
          layouts={layouts}
          onLayoutChange={onLayoutChange}
        />
        <SettingsWidget 
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onResetLayout={resetLayout}
          showResetLayout={isEditMode && isCustomized}
          layouts={layouts}
        />
      </div>
    </div>
  )
}
