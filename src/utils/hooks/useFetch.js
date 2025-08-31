import { useQuery } from "react-query"

const useFetch = (url) => {
  const fetchData = async () => {
    if (!url) {
      throw new Error("URL is required")
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json()
  }

  return useQuery({
    queryKey: [url],
    queryFn: fetchData,
    enabled: !!url,
  })
}

export default useFetch