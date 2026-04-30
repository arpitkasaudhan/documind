"use client";

import Link from "next/link";
import { Brain, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface NavbarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export function Navbar({ user }: NavbarProps) {
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-neutral-900">DocuMind</span>
        </Link>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              <div className="w-px h-5 bg-neutral-200 mx-1" />

              <Link href="/settings">
                <Button variant="ghost" size="sm" className="gap-1.5" title="Settings">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>

              <div className="flex items-center gap-2 pl-1 ml-1 border-l border-neutral-200">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold select-none">
                  {initials}
                </div>
                <span className="text-sm text-neutral-700 hidden md:block max-w-30 truncate">
                  {user.name ?? user.email}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                  className="text-neutral-400 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link href="/register"><Button size="sm">Get started free</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
