import AdminNav from "./AdminNav";

// Marco común del panel interno (protegido por src/middleware.ts).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
