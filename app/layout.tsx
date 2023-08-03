import AutoLoginWrapper from "@/components/auto-login-wrapper";
import Footer from "@/components/footer";
import { JotaiProvider } from "@/components/jotai-provider";
import MesaSvg from "@/components/mesa-svg";
import { NavPrimary } from "@/components/nav-primary";
import PrimaryHeaderItem from "@/components/primary-header-item";
import { Toaster } from "@/components/ui/toaster";
import db from "@/db/api";
import Session from "@/lib/session";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import dynamic from "next/dynamic";
import { Source_Code_Pro, Source_Sans_3 } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import "./globals.css";

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

const UserActions = dynamic(
  () => import("@/components/user-actions").then((res) => res.default),
  { ssr: false }
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth } = await Session.fromCookies(cookies());
  const teams = auth ? await db.teams.teamsByMemberId(auth.user.teamId) : [];

  return (
    <JotaiProvider>
      <html
        lang="en"
        className={`${sourceSans3.variable} ${sourceCodePro.variable}`}
      >
        <body className="flex min-h-screen flex-col">
          <AutoLoginWrapper />
          <header className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-row items-center gap-x-2">
              <Link href="/">
                <MesaSvg />
              </Link>
              <PrimaryHeaderItem teams={teams} />
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <NavPrimary />
              <UserActions />
            </div>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
          <Toaster />
        </body>
      </html>
    </JotaiProvider>
  );
}
