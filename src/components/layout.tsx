import { Poppins } from "next/font/google";
import Header from "./header";
import Footer from "./footer";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        className={`${poppins.variable} font-sans flex flex-col min-h-screen`}
      >
        <Header />
        <main className="flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
