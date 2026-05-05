import ProtectedAppShell from "@/components/layout/ProtectedAppShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
