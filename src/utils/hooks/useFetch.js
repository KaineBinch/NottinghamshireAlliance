import { useQuery } from "react-query"

const useFetch = (url) => {
  const fetchData = async () => {
    const response = await fetch(url)
    return response.json()
  }
  return useQuery(url, fetchData)
}

export default useFetch