"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", adminNote: "" },
  { href: "/secrets", label: "Secrets", adminNote: "" },
  { href: "/risks", label: "Risks", adminNote: "" },
  {
    href: "/audit-logs",
    label: "Audit Logs",
    adminNote: "Admin only",
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const user = getUser();

  return (
    <>
      {/* Mobile drawer-style top stripe */}
      <aside className="fixed bottom-0 left-0 right-0 z-30 flex gap-1 border-t border-slate-800 bg-slate-950/95 p-2 backdrop-blur lg:bottom-auto lg:left-0 lg:right-auto lg:top-0 lg:h-screen lg:w-64 lg:flex-col lg:border-r lg:border-t-0 lg:p-4">
        <div className="hidden px-3 pb-6 pt-4 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
            SecureVault
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-100">
            CloudGuard
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Governance over secret metadata—not plaintext payloads.
          </p>
        </div>
        <nav className="flex flex-1 justify-around gap-1 lg:flex-none lg:flex-col lg:justify-start lg:gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
            const showAuditHint =
              item.href === "/audit-logs" && user?.role !== "admin";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[11px] font-medium lg:flex-row lg:items-start lg:gap-2 lg:px-3 lg:py-2.5 lg:text-sm ${
                  active
                    ? "bg-slate-800 text-cyan-200 ring-1 ring-cyan-500/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <span>{item.label}</span>
                {showAuditHint && item.adminNote ? (
                  <span className="hidden text-[10px] font-normal uppercase tracking-wide text-slate-500 lg:inline">
                    {item.adminNote}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
