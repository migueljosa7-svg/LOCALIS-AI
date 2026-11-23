import PlatformSubnav from "@/components/platform/PlatformSubnav";

export default function PlataformaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PlatformSubnav />
      {children}
    </>
  );
}
