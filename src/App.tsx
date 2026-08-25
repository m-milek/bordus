import { useState } from 'react'
import { Search } from 'lucide-react'
import { useConfig } from "@/lib/config"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Section } from "@/components/Section"

export const App = () => {
  const { config, error } = useConfig()
  const [searchQuery, setSearchQuery] = useState('')

  if (error) {
    return (
      <div className="text-destructive p-4">
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!config) {
    return <div className="p-4">Loading...</div>
  }

  // Filter logic
  const filteredCategories = config.categories?.map(category => {
    const filteredServices = category.services.filter(service => {
      const query = searchQuery.toLowerCase()
      return service.name.toLowerCase().includes(query) || 
             service.description?.toLowerCase().includes(query)
    })
    return { ...category, services: filteredServices }
  }).filter(category => category.services.length > 0)

  // Layout logic
  const columns = config.layout?.columns || 1
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
            {config.title || 'Dashboard'}
          </h1>
          <ThemeToggle />
        </div>

        {config.search && (
          <div className="mb-8 relative">
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

        <div style={gridStyle}>
          {filteredCategories?.map((category, index) => (
            <Section key={index} category={category} />
          ))}
        </div>
      </div>
    </div>
  )
}
