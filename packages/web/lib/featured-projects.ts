import { store } from "./store";

export async function featuredProjectSlugs() {
  if (process.env.NODE_ENV === "development") {
    return await store.projects.firstNProjectSlugs(5);
  } else if (process.env.SITE_DOMAIN?.includes("staging")) {
    return [
      { team: "aaron", project: "four-project" },
      { team: "joe", project: "students" },
      { team: "aaron", project: "with-timestamp" },
    ];
  } else {
    return [
      { team: "team1", project: "project1" },
      { team: "team2", project: "project2" },
      { team: "team3", project: "project3" },
    ];
  }
}
