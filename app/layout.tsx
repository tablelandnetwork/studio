import Footer from "@/components/footer";
import Header from "@/components/header";
import { TrpcProvider } from "@/components/trpc-provider";
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
    <TrpcProvider>
      <html lang="en">
        <body
          className={`${poppins.className} flex min-h-screen flex-col font-sans`}
        >
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </body>
      </html>
    </TrpcProvider>
  );
}
