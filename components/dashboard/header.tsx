"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight font-instrument-serif">Calpoint</h1>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-foreground">
            Dashboard
          </Link>
          <Link href="/logs" className="text-sm text-muted-foreground hover:text-foreground">
            Logs
          </Link>
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
            Settings
          </Link>
          <UserButton />
        </nav>
      </div>
    </header>
  );
}
