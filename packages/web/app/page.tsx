import {
  Info,
  LogIn,
  Wallet,
  AlertTriangle,
  UserCircle,
  Play,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { RouterOutputs, Session } from "@tableland/studio-api";
import { TypographyH1 } from "@/components/typography-h1";
import { TypographyH2 } from "@/components/typography-h2";
import { TypographyH3 } from "@/components/typography-h3";
import { TypographyP } from "@/components/typography-p";
import { featuredProjectSlugs } from "@/lib/featured-projects";
import { store } from "@/lib/store";
import TeamAvatar from "@/components/team-avatar";
import { LatestTables } from "./_components/latest-tables";
import { getLatestTables, getPopularTables } from "@/lib/validator-queries";
import { PopularTables } from "./_components/popular-tables";
import { LatestProjects } from "./_components/latest-projects";
import { cache } from "react";
import { api } from "@/trpc/server";

export default async function Page() {
  const session = await Session.fromCookies(cookies());

  let teams: RouterOutputs["teams"]["userTeams"] = [];
  if (session.auth) {
    try {
      teams = await cache(api.teams.userTeams.query)({
        userTeamId: session.auth.user.teamId,
      });
    } catch {
      // This is fine, we just don't have any teams if the user
      // is unauthorized or some other error happens.
    }
  }

  const projectSlugs = await featuredProjectSlugs();
  const featuredProjects = (
    await Promise.all(
      projectSlugs.map((slugs) =>
        store.projects.projectByTeamAndProjectSlugs(slugs.team, slugs.project),
      ),
    )
  ).filter((p) => !!p) as NonNullable<
    Awaited<ReturnType<typeof store.projects.projectByTeamAndProjectSlugs>>
  >[];
  const latestProjects = await store.projects.latestProjects(0, 1000);
  const latestTables = await getLatestTables("mainnets");
  const popularTables = await getPopularTables("mainnets");

  return (
    <main className="container flex max-w-4xl flex-1 flex-col gap-y-32 p-4 py-32">
      <section>
        <div className="flex items-center justify-center space-x-4">
          <TypographyH1>Welcome to Tableland Studio!</TypographyH1>
        </div>
        <div className="m-auto flex flex-1 flex-col justify-center gap-4 pt-16">
          {session.auth ? (
            <>
              <div className="flex items-center space-x-4">
                <UserCircle className="flex-shrink-0" />
                <p>You're logged in!</p>
              </div>
              <div className="flex items-center space-x-4">
                <Play className="flex-shrink-0" />
                <p>
                  Get started by selecting one of your teams or by exploring
                  Studio Projects and Tableland tables below.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <Info className="flex-shrink-0" />
                <p>
                  Tableland Studio makes it easy to design and deploy tables on
                  Tableland, collaborate with teammates on projects, integrate
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
                  Then log into Studio using the button in the upper right
                  corner of the screen. You&apos;ll be prompted to choose a
                  Studio username and then you&apos;ll be redirected to the
                  Studio page for your personal Team.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
      {session.auth && (
        <section>
          <TypographyH2>Your Teams</TypographyH2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/${team.slug}`}
                className="flex grow basis-1 flex-col items-start gap-2 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent"
              >
                <div className="flex w-full flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <TeamAvatar team={team} />
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{team.name}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section>
        {/* <div className="flex items-baseline gap-4">
          <Search /> */}
        <TypographyH2>Explore Studio Projects</TypographyH2>
        {/* </div> */}
        <TypographyP>
          User's work in Studio is organized into Projects. Learn about any
          Project by reading it's description and viewing it's table
          definitions. Soon we'll be launching a feature allowing you to clone
          any project as a quick way to get started.
        </TypographyP>
        <TypographyH3>Featured Studio Projects</TypographyH3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {featuredProjects.map((item) => (
            <Link
              key={item.project.id}
              href={`/${item.team.slug}/${item.project.slug}`}
              className="flex grow basis-1 flex-col items-start gap-2 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent"
            >
              <div className="flex w-full flex-col gap-4">
                <div className="flex items-center gap-2">
                  <TeamAvatar team={item.team} />
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">
                      {item.team.name}/{item.project.name}
                    </div>
                  </div>
                </div>
                <div className="line-clamp-5 text-sm text-muted-foreground">
                  {item.project.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <LatestProjects projects={latestProjects} />
      </section>
      <section>
        <TypographyH2>Explore the wider Tableland landscape</TypographyH2>
        <TypographyP>
          Studio is built to make using Tableland easier and more visual,
          however many people use Tableland directly as well. Below, you can
          explore tables on Tableland that aren't necessairily part of any
          Studio project. You may find inspiration, or even a table you want to
          use in your own Studio project.
        </TypographyP>
        <LatestTables initialData={latestTables} />
        <PopularTables initialData={popularTables} />
      </section>
    </main>
  );
}
