import { useEffect, useMemo, useState } from "react"
import type Fuse from "fuse.js"
import { Category, Service } from "@/lib/config"

type FuseCtor = typeof Fuse

/**
 * Fuse is only needed once someone types, so it is kept off the critical path
 * and fetched on the first keystroke. Until it lands, results fall back to a
 * substring match, which is instant and good enough for one frame.
 */
let fusePromise: Promise<FuseCtor> | null = null

const loadFuse = () => {
  fusePromise ??= import("fuse.js").then((module) => module.default)
  return fusePromise
}

const substringMatch = (services: Service[], query: string) => {
  const needle = query.toLowerCase()
  return services.filter(
    (service) =>
      service.name.toLowerCase().includes(needle) ||
      service.url.toLowerCase().includes(needle) ||
      service.categoryName?.toLowerCase().includes(needle)
  )
}

export const useFilteredServices = (
  categories: Category[] | undefined,
  searchQuery: string
): Service[] => {
  const [FuseClass, setFuseClass] = useState<FuseCtor | null>(null)
  const isSearching = searchQuery.trim() !== ""

  useEffect(() => {
    if (!isSearching || FuseClass) return
    let active = true
    loadFuse().then((loaded) => {
      if (active) setFuseClass(() => loaded)
    })
    return () => {
      active = false
    }
  }, [isSearching, FuseClass])

  const allServices = useMemo(
    () =>
      (categories ?? []).flatMap((category) =>
        category.services.map((service) => ({
          ...service,
          categoryName: category.name,
          categoryColor: category.color,
        }))
      ),
    [categories]
  )

  return useMemo(() => {
    if (!isSearching) return allServices
    if (!FuseClass) return substringMatch(allServices, searchQuery)

    const fuse = new FuseClass(allServices, {
      keys: ["name", "url", "categoryName"],
      threshold: 0.25,
    })

    return fuse.search(searchQuery).map((result) => result.item)
  }, [allServices, searchQuery, isSearching, FuseClass])
}
