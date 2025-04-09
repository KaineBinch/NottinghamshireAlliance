const CACHE_PREFIX = 'notts_alliance_api_cache_';
const CACHE_DURATION = 15 * 60 * 1000;
const STALE_THRESHOLD = 10 * 60 * 1000;

export const getFromCache = (url) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${url}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = Date.now();

      if (now - timestamp < CACHE_DURATION) {
        return data;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn('Error reading from cache:', error.message);
  }

  return null;
};

export const isCacheExpiring = (url) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${url}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { timestamp } = JSON.parse(cachedData);
      const now = Date.now();

      return (now - timestamp) > (CACHE_DURATION - STALE_THRESHOLD);
    }
  } catch (error) {
    console.warn('Error checking cache expiry:', error.message);
  }

  return true;
};

export const saveToCache = (url, data) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${url}`;

    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    );

    return true;
  } catch (error) {
    console.warn('Error writing to cache:', error.message);
    return false;
  }
};

export const clearCache = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key);
      }
    }

    keys.forEach(key => localStorage.removeItem(key));
    return keys.length;
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    return 0;
  }
};

export const invalidateCacheByPattern = (pattern) => {
  try {
    const regex = new RegExp(pattern);
    const keys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        const url = key.substring(CACHE_PREFIX.length);
        if (regex.test(url)) {
          localStorage.removeItem(key);
          keys.push(key);
        }
      }
    }

    return keys.length;
  } catch (error) {
    console.error('Error invalidating cache:', error.message);
    return 0;
  }
};

export const forceRefresh = (url) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${url}`;
    localStorage.removeItem(cacheKey);
    return true;
  } catch (error) {
    console.warn('Error forcing refresh:', error.message);
    return false;
  }
};