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
        className={`${poppins.variable} flex min-h-screen flex-col font-sans`}
      >
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
    </>
  );
}
