import { useState } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
import { Config } from "@/lib/config"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Section } from "@/components/Section"

export interface AppProps {
  config: Config | null
  error: string | null
}

export const App = ({ config, error }: AppProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter logic
  const filteredCategories = config?.categories?.map(category => {
    const filteredServices = category.services.filter(service => {
      const query = searchQuery.toLowerCase()
      return service.name.toLowerCase().includes(query) || 
             service.description?.toLowerCase().includes(query)
    })
    return { ...category, services: filteredServices }
  }).filter(category => category.services.length > 0)

  // Layout logic
  const columns = config?.layout?.columns || 1
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: '1.5rem'
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {config?.title || 'Dashboard'}
          </h1>
          <ThemeToggle />
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive border-l-4 border-destructive p-4 mb-8 rounded-md flex items-start gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold">Configuration Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {config?.search && (
          <div className="mb-8 relative shadow-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="w-full p-3 pl-10 rounded-md bg-muted text-foreground border-none outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {filteredCategories && filteredCategories.length > 0 && (
          <div style={gridStyle}>
            {filteredCategories.map((category, index) => (
              <Section key={index} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
