import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { Category } from "@/lib/config"

export const useFilteredCategories = (categories: Category[] | undefined, searchQuery: string) => {
  return useMemo(() => {
    if (!categories) return []
    if (!searchQuery.trim()) return categories

    return categories.map(category => {
      const fuse = new Fuse(category.services, {
        keys: ['name', 'description'],
        threshold: 0.4, // 0.0 is exact match, 1.0 is match anything
      })
      
      const results = fuse.search(searchQuery)
      const filteredServices = results.map(result => result.item)
      
      return { ...category, services: filteredServices }
    }).filter(category => category.services.length > 0)
  }, [categories, searchQuery])
}
