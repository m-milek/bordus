import { useEffect, useState } from "react"

export const useWidgetData = <T>(
  fetcher: () => Promise<T>,
  intervalMs?: number
) => {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    let active = true
    const load = () =>
      fetcher().then(
        (result) => {
          if (!active) return
          setData(result)
          setError(undefined)
        },
        (reason: Error) => active && setError(reason)
      )
    load()
    const id = intervalMs ? setInterval(load, intervalMs) : undefined
    return () => {
      active = false
      clearInterval(id)
    }
  }, [fetcher, intervalMs])

  return { data, error }
}
