export const BASE_URL = "http://localhost:1337"
export const API_URL = BASE_URL + "/api"
export const MODELS = {
  golfClubs: "/golf-clubs",
  scores: "/scores",
  rules: "/rules",
  conditions: "/conditions",
  contact: "/contacts",
  social: "/socials",
}
export const QUERIES = {
  clubsQuery: "?sort[0]=clubName:asc&populate=*",
  rulesQuery: "?sort[0]=ruleTitle:asc",
  conditionsQuery: "?sort[0]=conditionTitle:asc",
  contactQuery: "",
  socialQuery: "",
  csvImport: "/import-csv"
}
