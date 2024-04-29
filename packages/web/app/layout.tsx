import { type RouterOutputs, getSession } from "@tableland/studio-api";
import dynamic from "next/dynamic";
import { Source_Code_Pro, Source_Sans_3 } from "next/font/google";
import { headers, cookies } from "next/headers";
// import Script from "next/script";
import { cache } from "react";
import { Analytics } from "@vercel/analytics/react";
import PathAwareHeader from "./_components/path-aware-header";
import PrimaryHeaderItem from "./_components/primary-header-item";
import { api } from "@/trpc/server";
import { TRPCReactProvider } from "@/trpc/react";
import WagmiProvider from "@/components/wagmi-provider";
import { Toaster } from "@/components/ui/toaster";
import { NavPrimary } from "@/components/nav-primary";
import Hotjar from "@/components/hotjar";
import { JotaiProvider } from "@/components/jotai-provider";
import "./globals.css";
import { TimeAgoProvider } from "@/components/time-ago-provider";

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
  const session = await getSession({ cookies: cookies(), headers: headers() });
  let teams: RouterOutputs["teams"]["userTeams"] = [];
  if (session.auth) {
    try {
      teams = await cache(api.teams.userTeams)({
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
              <TRPCReactProvider headers={headers()}>
                <PathAwareHeader className="flex items-center justify-between bg-[#202132] px-4 py-3">
                  <PrimaryHeaderItem teams={teams} />
                  <div className="ml-auto flex items-center space-x-4">
                    <NavPrimary />
                    <Profile />
                  </div>
                </PathAwareHeader>
                <div className="flex flex-1 flex-col">{children}</div>
                <Toaster />
              </TRPCReactProvider>
              <script
                id="maze"
                data-document-language="true"
                dangerouslySetInnerHTML={{
                  __html: `
                  (function (m, a, z, e) {var s, t;try {t = m.sessionStorage.getItem('maze-us');} catch (err) {} if (!t) {t = new Date().getTime();try {m.sessionStorage.setItem('maze-us', t);} catch (err) {}} s = a.createElement('script');s.src = z + '?apiKey=' + e;s.async = true;a.getElementsByTagName('head')[0].appendChild(s);m.mazeUniversalSnippetApiKey = e;})(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'ee647aa6-0377-4302-b3f0-67b50f58c48b');
                  `,
                }}
                async
              ></script>
              {/* TODO: the script above attempts to implement the same as below with a raw `<script>`. 

                The component below causes a hydration error that breaks all routes...eslint disabling doesn't fix it:
                ```
                `next/script`'s `beforeInteractive` strategy should not be used outside of 
                `pages/_document.js`. See: https://nextjs.org/docs/messages/no-before-interactive-script-outside-document 
                ```
                The docs in that link are incorrect, so it's not clear how to fix it. 
                See this for more detail: https://github.com/vercel/next.js/pull/63401
               */}
              {/* <Script
                id="maze"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{
                  __html: `(function (m, a, z, e) {var s, t;try {t = m.sessionStorage.getItem('maze-us');} catch (err) {} if (!t) {t = new Date().getTime();try {m.sessionStorage.setItem('maze-us', t);} catch (err) {}} s = a.createElement('script');s.src = z + '?apiKey=' + e;s.async = true;a.getElementsByTagName('head')[0].appendChild(s);m.mazeUniversalSnippetApiKey = e;})(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'ee647aa6-0377-4302-b3f0-67b50f58c48b');`,
                }}
              ></Script> */}
              <Analytics />
            </body>
          </html>
        </TimeAgoProvider>
      </JotaiProvider>
    </WagmiProvider>
  );
}
