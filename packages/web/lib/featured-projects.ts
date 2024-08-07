import { getBaseUrl } from "@tableland/studio-client";
import { store } from "./store";

export async function featuredProjectSlugs() {
  const baseUrl = getBaseUrl();

  if (process.env.NODE_ENV === "development") {
    return await store.projects.firstNProjectSlugs(5);
  } else if (baseUrl === "https://studio.tableland.xyz") {
    return [
      {
        org: "partners",
        project: "dimo", // Only a sample of non-active testnet tables (over 140 total)
      },
      {
        org: "partners",
        project: "hideout-labs", // Non-active testnets tables
      },
      // {
      //   org: "partners",
      //   project: "drvrs", // No tables
      // },
      {
        org: "tableland",
        project: "studio", // Active Tableland Studio tables
      },
      {
        org: "tableland",
        project: "rigs", // Active Tableland Rigs tables
      },
    ];
  } else {
    // It's a preview deployment.
    return [
      { org: "aaron", project: "four-project" },
      { org: "joe", project: "students" },
      { org: "aaron", project: "with-timestamp" },
    ];
  }
}
