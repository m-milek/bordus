import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { Category, Service } from "@/lib/config"

export const useFilteredServices = (categories: Category[] | undefined, searchQuery: string): Service[] => {
  return useMemo(() => {
    if (!categories) return []
    
    // Flatten categories into a single list of services, injecting category info
    const allServices = categories.flatMap(cat => 
      cat.services.map(service => ({
        ...service,
        categoryName: cat.name,
        categoryColor: cat.color
      }))
    )

    if (!searchQuery.trim()) return allServices

    const fuse = new Fuse(allServices, {
      keys: ['name', 'url', 'categoryName'],
      threshold: 0.25,
    })
    
    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [categories, searchQuery])
}
