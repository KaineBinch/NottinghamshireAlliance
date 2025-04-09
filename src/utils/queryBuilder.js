import { API_URL } from "../constants/api"

export const queryBuilder = (model, query, options = {}) => {
  const { bustCache = false } = options;

  let url = API_URL + model + query;

  // Add a timestamp parameter to bust caching
  if (bustCache) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}_t=${Date.now()}`;
  }

  return url;
}
