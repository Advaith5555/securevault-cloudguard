"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { clearSession, getUser } from "@/lib/auth";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const router = useRouter();
  const user = getUser();

  function logout() {
    clearSession();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">{title}</h1>
          {user?.role !== "viewer" ? null : (
            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
              Viewer role: read-only dashboards and lists; destructive actions
              are hidden upstream.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="truncate text-sm text-slate-200">{user.email}</p>
              </div>
              <Badge kind="role" value={user.role} />
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800"
              >
                Log out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
