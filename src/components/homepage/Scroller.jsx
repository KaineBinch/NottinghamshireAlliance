import { queryBuilder } from "../../utils/queryBuilder"
import { BASE_URL, MODELS, QUERIES } from "../../constants/api"
import useFetch from "../../utils/hooks/useFetch"
import ScrollingImages from "./scrollingImages"

const LogoScroller = () => {
  const query = queryBuilder(MODELS.golfClubs, QUERIES.clubsQuery)
  const { isLoading, isError, data, error } = useFetch(query)

  if (isLoading) {
    return <p className="pt-[85px]">Loading...</p>
  }
  if (isError) {
    console.error("Error:", error)
    return <p className="pt-[85px]">Something went wrong...</p>
  }

  const clubLogos =
    data?.data
      ?.filter(
        (club) => club.clubLogo && club.clubLogo[0] && club.clubLogo[0].url
      )
      .map((club) => `${BASE_URL}${club.clubLogo[0].url}`) || []

  return (
    <div className="flex flex-col items-center bg-[#214A27]">
      <hr className="border-black w-full" />
      <div className="h-[75px] overflow-hidden flex items-center justify-center w-full mx-auto">
        <ScrollingImages images={clubLogos} velocity={-50} />
      </div>
      <hr className="border-black w-full" />
    </div>
  )
}

export default LogoScroller
