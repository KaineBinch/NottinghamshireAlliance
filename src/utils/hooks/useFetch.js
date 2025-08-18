import { useQuery } from "react-query"

const useFetch = (url) => {
  const fetchData = async () => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json()
  }

  return useQuery(url, fetchData)
}

export default useFetch