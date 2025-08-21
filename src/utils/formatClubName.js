export const formatClubName = (clubName) => {
  if (!clubName) return "Golf Club"

  // If it already ends with "Club", use as-is, otherwise add "Golf Club"
  return clubName.toLowerCase().endsWith("club")
    ? clubName
    : `${clubName} Golf Club`
}