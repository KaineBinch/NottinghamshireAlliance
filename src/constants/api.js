const isProd = import.meta.env.VITE_ENV === 'production';
if (!isProd) console.log('Running in production mode?', isProd);

export const API_BASE_URLS = {
  local: 'http://localhost:1337',
  production: import.meta.env.VITE_API_URL
};

export const BASE_URL = isProd ? API_BASE_URLS.production : API_BASE_URLS.local;

export const API_URL = BASE_URL + "/api";

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
  clubOfficers: "/officers"
};

export const QUERIES = {
  clubsQuery: "?sort[0]=clubName:asc&populate=*",
  rulesQuery: "?sort[0]=ruleTitle:asc",
  conditionsQuery: "?sort[0]=conditionTitle:asc",
  contactQuery: "",
  socialQuery: "",
  resultsQuery: "?sort[0]=eventDate:asc&populate=scores.golfer.golf_club&populate=golf_club&populate=golf_club.clubImage",
  eventsQuery: "?sort[0]=eventDate:asc&populate[1]=golf_club&populate=golf_club.clubImage",
  teeTimesQuery: "?populate[0]=event.golf_club&populate[1]=golfers.golf_club&populate[2]=event.golf_club.clubLogo",
  oomQuery: "?populate[0]=event&populate[1]=golfer.golf_club",
  officerQuery: "?populate=*",
  csvImport: "/import-csv",
};