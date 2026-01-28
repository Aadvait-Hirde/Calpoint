"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  
  // Random background image - set on client only to avoid hydration mismatch
  const [backgroundNumber, setBackgroundNumber] = useState(1);
  
  useEffect(() => {
    setBackgroundNumber(Math.floor(Math.random() * 10) + 1);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/logs", label: "Logs" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/backgrounds/bg-${backgroundNumber}.jpg')`,
        }}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Navbar - Floating translucent style */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="shrink-0">
            <h1 className="text-2xl font-light tracking-tight font-instrument-serif text-white">
              Calpoint
            </h1>
          </Link>

          {/* Navigation Links - Fixed padding to be even */}
          <div className="flex items-center gap-1 p-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                  pathname === link.href
                    ? "bg-white/30 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Button */}
          <div className="shrink-0">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-20 px-6 pb-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}
