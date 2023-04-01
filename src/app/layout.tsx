import Login from "@/components/login";
import "./globals.css";
import Button from "@/components/button";

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
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <header className="p-5 flex justify-between items-center">
          <h1>Tableland Studio</h1>
          <nav></nav>
          <Login />
        </header>
        <main className="flex flex-col flex-1 justify-between items-center p-24">
          {children}
        </main>
        <footer className="p-5">
          <p>&copy;2023 Tableland. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
