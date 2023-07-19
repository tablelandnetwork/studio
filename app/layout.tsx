import AutoLoginWrapper from "@/components/auto-login-wrapper";
import Footer from "@/components/footer";
import HeaderPrimary from "@/components/header-primary";
import { JotaiProvider } from "@/components/jotai-provider";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans-3",
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
      <html lang="en" className={`${sourceSans3.variable}`}>
        <body className="flex min-h-screen flex-col font-sans">
          <AutoLoginWrapper />
          <HeaderPrimary />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </body>
      </html>
    </JotaiProvider>
  );
}
