import AdminNav from "./AdminNav";

// Marco común del panel interno (protegido por src/middleware.ts): menú lateral en escritorio, pestañas en móvil.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
