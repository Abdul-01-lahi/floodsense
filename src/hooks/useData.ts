import { useEffect, useState } from 'react'
import { DATA_BASE, DATA_VERSION } from '../lib/config'

const dataCache = new Map<string, unknown>()
const pendingRequests = new Map<string, Promise<unknown>>()

interface DataState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

function useData<T>(path: string): DataState<T> {
  const hasCachedData = dataCache.has(path)
  const cachedData = dataCache.get(path) as T | undefined
  const [data, setData] = useState<T | null>(cachedData ?? null)
  const [loadedPath, setLoadedPath] = useState(path)
  const [loading, setLoading] = useState(!hasCachedData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true

    if (dataCache.has(path)) {
      return () => {
        active = false
      }
    }

    let request = pendingRequests.get(path)
    if (!request) {
      request = fetch(
        `${DATA_BASE}/${path}?v=${encodeURIComponent(DATA_VERSION)}`,
      ).then(
        async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load data (${response.status})`)
        }

        const result: unknown = await response.json()
        dataCache.set(path, result)
        pendingRequests.delete(path)
        return result
        },
      )
      pendingRequests.set(path, request)
    }

    request
      .then((result) => {
        if (active) {
          setData(result as T)
          setLoadedPath(path)
          setError(null)
          setLoading(false)
        }
      })
      .catch((requestError: unknown) => {
        pendingRequests.delete(path)
        if (active) {
          setLoadedPath(path)
          setError(
            requestError instanceof Error
              ? requestError
              : new Error('Could not load data'),
          )
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [path])

  return {
    data: hasCachedData
      ? cachedData ?? null
      : loadedPath === path
        ? data
        : null,
    loading: hasCachedData ? false : loadedPath !== path ? true : loading,
    error: loadedPath === path ? error : null,
  }
}

export default useData
