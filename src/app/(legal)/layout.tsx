import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="contenido" className="w-full min-w-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
