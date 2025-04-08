/**
 * Cache service for API data
 */

const CACHE_PREFIX = 'notts_alliance_api_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Get data from cache
export const getFromCache = (url) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${url}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = Date.now();

      // If cache is still valid
      if (now - timestamp < CACHE_EXPIRY) {
        return data;
      } else {
        // Cache expired, clean it up
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn('Error reading from cache:', error.message);
  }

  return null;
};

// Save data to cache
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

// Clear all API cache entries
export const clearCache = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(CACHE_PREFIX)) {
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

// Get all cached keys
export const getCachedKeys = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(CACHE_PREFIX)) {
        keys.push({
          key: key.replace(CACHE_PREFIX, ''),
          timestamp: JSON.parse(localStorage.getItem(key)).timestamp
        });
      }
    }
    return keys;
  } catch (error) {
    console.error('Error getting cached keys:', error.message);
    return [];
  }
};

// Check if cache is about to expire (within the next hour)
export const isCacheExpiring = (url) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${url}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      // If cache will expire within the next hour
      return (now - timestamp) > (CACHE_EXPIRY - oneHour);
    }
  } catch (error) {
    console.warn('Error checking cache expiry:', error.message);
  }

  return true; // If any error or no cache, consider it expiring
};

// Get remaining cache time in minutes
export const getCacheTimeRemaining = (url) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${url}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      const expiryTime = timestamp + CACHE_EXPIRY;
      const remainingMs = expiryTime - now;

      if (remainingMs > 0) {
        return Math.floor(remainingMs / (60 * 1000)); // Convert to minutes
      }
    }
  } catch (error) {
    console.warn('Error calculating cache time remaining:', error.message);
  }

  return 0; // If any error or no cache, return 0 minutes
};