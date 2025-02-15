export const BASE_URL = "http://localhost:1337"
export const API_URL = BASE_URL + "/api"
export const MODELS = {
  golfClubs: "/golf-clubs",
  scores: "/scores",
  rules: "/rules",
  conditions: "/conditions",
  contact: "/contacts",
  social: "/socials",
  events: "/events",
  teeTimes: "/tee-times",
  imports: "/imports",
}
export const QUERIES = {
  clubsQuery: "?sort[0]=clubName:asc&populate=*",
  rulesQuery: "?sort[0]=ruleTitle:asc",
  conditionsQuery: "?sort[0]=conditionTitle:asc",
  contactQuery: "",
  socialQuery: "",
  eventsQuery: "?sort[0]=eventDate:asc&populate[golf_club][populate]=clubImage",
  teeTimesQuery: "?populate[0]=event.golf_club&populate[1]=golfers.golf_club&populate[2]=event.golf_club.clubLogo",
  oomQuery: "?populate[0]=event&populate[1]=golfer.golf_club",
  csvImport: "/import-csv"
}
