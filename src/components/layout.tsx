import Header from "./header";
import Footer from "./footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex flex-col flex-1 justify-between items-center p-24">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
