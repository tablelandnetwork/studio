import { getBaseUrl } from "@tableland/studio-client";
import { store } from "./store";

export async function featuredProjectSlugs() {
  const baseUrl = getBaseUrl();

  if (process.env.NODE_ENV === "development") {
    return await store.projects.firstNProjectSlugs(5);
  } else if (baseUrl === "https://studio.tableland.xyz") {
    return [
      {
        team: "partners",
        project: "dimo", // Only a sample of non-active testnet tables (over 140 total)
      },
      {
        team: "partners",
        project: "hideout-labs", // Non-active testnets tables
      },
      // {
      //   team: "partners",
      //   project: "drvrs", // No tables
      // },
      {
        team: "tableland",
        project: "studio", // Active Tableland Studio tables
      },
      {
        team: "tableland",
        project: "rigs", // Active Tableland Rigs tables
      },
    ];
  } else {
    // It's a preview deployment.
    return [
      { team: "aaron", project: "four-project" },
      { team: "joe", project: "students" },
      { team: "aaron", project: "with-timestamp" },
    ];
  }
}
