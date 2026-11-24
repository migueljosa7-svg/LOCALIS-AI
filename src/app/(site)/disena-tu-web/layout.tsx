import { builderFontClass } from "@/lib/builder/fonts";

// Las tipografías de la vista previa solo se cargan en el editor.
export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <div className={builderFontClass}>{children}</div>;
}
