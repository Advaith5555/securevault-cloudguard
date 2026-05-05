"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { isAuthenticated } from "@/lib/auth";

const TITLE_BY_PATH: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/secrets": "Secrets",
  "/risks": "Risk posture",
  "/audit-logs": "Audit logs",
};

export default function ProtectedAppShell({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <LoadingState message="Checking session…" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <LoadingState message="Redirecting to sign in…" />
      </div>
    );
  }

  const title = TITLE_BY_PATH[pathname ?? ""] ?? "SecureVault CloudGuard";

  return <AppShell title={title}>{children}</AppShell>;
}
