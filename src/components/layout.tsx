import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";

import Footer from "./footer";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
});

const AutoLogin = dynamic(
  () => import("./auto-login").then((res) => res.default),
  { ssr: false }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AutoLogin />
      <div
        className={`${poppins.variable} font-sans flex flex-col min-h-screen`}
      >
        <main className="flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
