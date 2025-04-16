import { API_URL } from "../constants/api"

export const queryBuilder = (model, query) => {
  return API_URL + model + query
}