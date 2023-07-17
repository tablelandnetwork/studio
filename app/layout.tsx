import AutoLoginWrapper from "@/components/auto-login-wrapper";
import Footer from "@/components/footer";
import HeaderPrimary from "@/components/header-primary";
import { JotaiProvider } from "@/components/jotai-provider";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
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
      <html lang="en">
        <body
          className={`${poppins.className} flex min-h-screen flex-col font-sans`}
        >
          <AutoLoginWrapper />
          <HeaderPrimary />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </body>
      </html>
    </JotaiProvider>
  );
}
