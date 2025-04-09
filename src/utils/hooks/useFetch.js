import { useQuery } from "react-query"
import { getFromCache, saveToCache, isCacheExpiring } from "../api/cacheService"

const useFetch = (url, options = {}) => {
  const {
    cacheTime = 15 * 60 * 1000,
    forceRefresh = false,
    ...queryOptions
  } = options;

  const fetchWithCache = async ({ queryKey }) => {
    const [actualUrl] = queryKey;

    if (!forceRefresh) {
      const cachedData = getFromCache(actualUrl);
      if (cachedData) {
        setTimeout(() => {
          if (isCacheExpiring(actualUrl)) {
            fetch(actualUrl)
              .then(response => response.json())
              .then(freshData => {
                saveToCache(actualUrl, freshData);
              })
              .catch(err => console.warn('Background refresh failed:', err));
          }
        }, 0);

        return cachedData;
      }
    }

    const response = await fetch(actualUrl)
    const data = await response.json()

    if (!forceRefresh) {
      saveToCache(actualUrl, data)
    }

    return data
  }

  return useQuery(url, fetchWithCache, {
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2 * 60 * 1000,
    cacheTime: cacheTime,
    ...queryOptions,
  })
}

export default useFetch