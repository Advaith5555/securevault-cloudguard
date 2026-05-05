"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: ReactNode;
  title: string;
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <Topbar title={title} />
        <main className="flex-1 px-4 pb-24 pt-8 sm:px-6 lg:pb-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
