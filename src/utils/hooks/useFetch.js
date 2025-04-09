import { useQuery } from "react-query"
import { getFromCache, saveToCache, isCacheExpiring } from "../api/cacheService"

const useFetch = (url, options = {}) => {
  const {
    cacheTime = 15 * 60 * 1000,
    forceRefresh = false,
    bustCache = false, // New option
    ...queryOptions
  } = options;

  // If bustCache is true, append timestamp to the URL
  const queryUrl = bustCache ?
    `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` :
    url;

  const fetchWithCache = async ({ queryKey }) => {
    const [actualUrl] = queryKey;

    if (!forceRefresh && !bustCache) {
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

    if (!forceRefresh && !bustCache) {
      saveToCache(actualUrl, data)
    }

    return data
  }

  return useQuery(queryUrl, fetchWithCache, {
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: bustCache ? 0 : 2 * 60 * 1000, // Zero stale time if bustCache is true
    cacheTime: bustCache ? 0 : cacheTime,     // Zero cache time if bustCache is true
    ...queryOptions,
  })
}

export default useFetch