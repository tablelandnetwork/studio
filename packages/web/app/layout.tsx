import { type RouterOutputs, Session } from "@tableland/studio-api";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import dynamic from "next/dynamic";
import { Source_Code_Pro, Source_Sans_3 } from "next/font/google";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import Script from "next/script";
import { cache } from "react";
import { Analytics } from "@vercel/analytics/react";
import Footer from "./_components/footer";
import { ThemeSwitcher } from "./_components/theme-switcher";
import { api } from "@/trpc/server";
import { TRPCReactProvider } from "@/trpc/react";
import WagmiProvider from "@/components/wagmi-provider";
import { Toaster } from "@/components/ui/toaster";
import PrimaryHeaderItem from "@/components/primary-header-item";
import { NavPrimary } from "@/components/nav-primary";
import MesaSvg from "@/components/mesa-svg";
import Hotjar from "@/components/hotjar";
import { JotaiProvider } from "@/components/jotai-provider";
import "./globals.css";
import { TimeAgoProvider } from "@/components/time-ago-provider";
import { ThemeProvider } from "@/components/theme-provider";

TimeAgo.addDefaultLocale(en);

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans-3",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-code-pro",
});

export const metadata = {
  title: "Tableland Studio",
  description:
    "Discover, design, deploy, and manage data driven web3 apps on Tableland.",
};

const Profile = dynamic(
  async function () {
    return await import("@/components/profile");
  },
  { ssr: false },
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <WagmiProvider>
      <JotaiProvider>
        <TimeAgoProvider>
          <html
            lang="en"
            className={`${sourceSans3.variable} ${sourceCodePro.variable}`}
          >
            <body className="flex min-h-screen flex-col">
              <Hotjar></Hotjar>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <TRPCReactProvider headers={headers()}>
                  <header className="flex items-center justify-between px-4 py-3">
                    <div className="flex flex-row items-center gap-x-2">
                      <Link href="/">
                        <MesaSvg />
                      </Link>
                      <PrimaryHeaderItem teams={teams} />
                    </div>
                    <div className="ml-auto flex items-center space-x-4">
                      <NavPrimary />
                      <Profile />
                      <ThemeSwitcher />
                    </div>
                  </header>
                  <div className="flex flex-1 flex-col">{children}</div>
                  <Footer />
                  <Toaster />
                </TRPCReactProvider>
              </ThemeProvider>
              <Script
                id="maze"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{
                  __html: `(function (m, a, z, e) {var s, t;try {t = m.sessionStorage.getItem('maze-us');} catch (err) {} if (!t) {t = new Date().getTime();try {m.sessionStorage.setItem('maze-us', t);} catch (err) {}} s = a.createElement('script');s.src = z + '?apiKey=' + e;s.async = true;a.getElementsByTagName('head')[0].appendChild(s);m.mazeUniversalSnippetApiKey = e;})(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'ee647aa6-0377-4302-b3f0-67b50f58c48b');`,
                }}
              ></Script>
              <Analytics />
            </body>
          </html>
        </TimeAgoProvider>
      </JotaiProvider>
    </WagmiProvider>
  );
}
