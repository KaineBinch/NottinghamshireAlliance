import { useQuery } from "react-query"
import { getFromCache, saveToCache } from "../api/cacheService"

const useFetch = (url) => {
  const fetchWithCache = async () => {
    const cachedData = getFromCache(url)
    if (cachedData) {
      return cachedData
    }

    const response = await fetch(url)
    const data = await response.json()

    saveToCache(url, data)

    return data
  }

  return useQuery(url, fetchWithCache, {
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export default useFetch