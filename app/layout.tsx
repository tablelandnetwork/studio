import AutoLoginWrapper from "@/components/auto-login-wrapper";
import Footer from "@/components/footer";
import HeaderPrimary from "@/components/header-primary";
import { JotaiProvider } from "@/components/jotai-provider";

import { Source_Code_Pro, Source_Sans_3 } from "next/font/google";
import "./globals.scss";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <JotaiProvider>
      <html
        lang="en"
        className={`${sourceSans3.variable} ${sourceCodePro.variable}`}
      >
        <body className="flex min-h-screen flex-col">
          <AutoLoginWrapper />
          <HeaderPrimary />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </body>
      </html>
    </JotaiProvider>
  );
}
