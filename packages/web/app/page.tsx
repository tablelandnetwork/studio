import {
  Info,
  LogIn,
  Wallet,
  AlertTriangle,
  UserCircle,
  Play,
} from "lucide-react";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import { type RouterOutputs, getSession } from "@tableland/studio-api";
import { cache } from "react";
import { LatestTables } from "./_components/latest-tables";
import { PopularTables } from "./_components/popular-tables";
import { LatestProjects } from "./_components/latest-projects";
import { TypographyH1 } from "@/components/typography-h1";
import { TypographyH2 } from "@/components/typography-h2";
import { TypographyH3 } from "@/components/typography-h3";
import { TypographyP } from "@/components/typography-p";
import { featuredProjectSlugs } from "@/lib/featured-projects";
import { store } from "@/lib/store";
import OrgAvatar from "@/components/org-avatar";
import { getLatestTables, getPopularTables } from "@/lib/validator-queries";
import { api } from "@/trpc/server";

export default async function Page() {
  const session = await cache(getSession)({
    headers: headers(),
    cookies: cookies(),
  });

  let orgs: RouterOutputs["orgs"]["userOrgs"] = [];
  if (session.auth) {
    try {
      orgs = await cache(api.orgs.userOrgs)({
        userOrgId: session.auth.user.orgId,
      });
    } catch (e) {
      console.log("Failed to fetch user orgs:", e);
    }
  }

  const projectSlugs = await featuredProjectSlugs();
  const featuredProjects = (
    await Promise.all(
      projectSlugs.map(
        async (slugs) =>
          await store.projects.projectByOrgAndProjectSlugs(
            slugs.org,
            slugs.project,
          ),
      ),
    )
  ).filter((p) => !!p) as Array<
    NonNullable<
      Awaited<ReturnType<typeof store.projects.projectByOrgAndProjectSlugs>>
    >
  >;
  const latestProjects = await store.projects.latestProjects(0, 1000);
  const latestTables = await getLatestTables("mainnets");
  const popularTables = await getPopularTables("mainnets");

  return (
    <main className="container flex max-w-4xl flex-1 flex-col gap-y-32 p-4 py-32">
      <section>
        <div className="flex items-center justify-center space-x-4">
          <TypographyH1>Welcome to the Tableland Studio!</TypographyH1>
        </div>
        <div className="m-auto flex flex-1 flex-col justify-center gap-4 pt-16">
          {session.auth ? (
            <>
              <div className="flex items-center space-x-4">
                <UserCircle className="flex-shrink-0" />
                <p>You&apos;re logged in!</p>
              </div>
              <div className="flex items-center space-x-4">
                <Play className="flex-shrink-0" />
                <p>
                  Get started by selecting one of your orgs or by exploring
                  Studio Projects and Tableland tables below.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <Info className="flex-shrink-0" />
                <p>
                  The Tableland Studio makes it easy to design and deploy tables
                  on Tableland, collaborate with orgmates on projects, integrate
                  your project with the Studio CLI, and discover what other
                  users are building on Tableland.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <AlertTriangle className="flex-shrink-0" />
                <p>
                  Remember, everything you do on the blockchain is public.
                  Don&apos;t use the Studio for any private, illegal, or harmful
                  activities. Respect the law, our community, and each other.
                  Let&apos;s create together responsibly!
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Wallet className="flex-shrink-0" />
                <p>
                  Start by connecting your wallet using the button in the upper
                  right corner of the screen.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <LogIn className="flex-shrink-0" />
                <p>
                  Then, log into the Studio using the button in the upper right
                  corner of the screen. You&apos;ll be prompted to choose a
                  Studio username, and then you&apos;ll be redirected to the
                  Studio page for your personal Org.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
      {session.auth && (
        <section>
          <TypographyH2>Your Orgs</TypographyH2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {orgs.map((org) => (
              <Link
                key={org.id}
                href={`/${org.slug}`}
                className="flex grow basis-1 flex-col items-start gap-2 rounded-md border p-4 text-left text-sm transition-all hover:bg-accent"
              >
                <div className="flex w-full flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <OrgAvatar org={org} />
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{org.name}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {(featuredProjects.length > 0 || latestProjects.length > 0) && (
        <section>
          {/* <div className="flex items-baseline gap-4">
          <Search /> */}
          <TypographyH2>Explore Studio Projects</TypographyH2>
          {/* </div> */}
          <TypographyP>
            Your work in the Studio is organized into Projects. Learn about any
            Project by reading its description and viewing its table
            definitions. Soon, we&apos;ll be launching a feature allowing you to
            clone any project as a quick way to get started.
          </TypographyP>
          {featuredProjects.length === 0 ? null : (
            <>
              <TypographyH3>Featured Studio Projects</TypographyH3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {featuredProjects.map((item) => (
                  <Link
                    key={item.project.id}
                    href={`/${item.org.slug}/${item.project.slug}`}
                    className="flex grow basis-1 flex-col items-start gap-2 rounded-md border p-4 text-left text-sm transition-all hover:bg-accent"
                  >
                    <div className="flex w-full flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <OrgAvatar org={item.org} />
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">
                            {item.org.name}/{item.project.name}
                          </div>
                        </div>
                      </div>
                      <div className="line-clamp-5 whitespace-pre-wrap text-sm leading-tight text-muted-foreground">
                        {item.project.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
          {latestProjects.length === 0 ? null : (
            <LatestProjects projects={latestProjects} />
          )}
        </section>
      )}
      <section>
        <TypographyH2>Explore the wider Tableland landscape</TypographyH2>
        <TypographyP>
          The Studio is built to make using Tableland easier and more visual;
          however, many people use Tableland directly as well. Below, you can
          explore tables on Tableland that aren&apos;t necessarily part of any
          Studio project. You may find inspiration, or even a table you want to
          use in your own Studio project!
        </TypographyP>
        <LatestTables initialData={latestTables} />
        <PopularTables initialData={popularTables} />
      </section>
    </main>
  );
}
