export const appRoutes = {
  home: "/",
  notFound: "*",
  contact: "/contact",
  courses: "/courses",
  fixtures: "/fixtures",
  gallery: "/gallery",
  results: "/results",
  rules: "/rules",
  teeTimes: "/teetimes",
  oom: "/oom",
  template: "/template",
  admin: "/admin",
  clubofficers: "/clubofficers",

  furtherResult: (clubName) => `/results/${clubName}`,
};
