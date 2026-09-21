"use client";

import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { Home, Leaf, LogOut, Recycle, Shield, Store, UserRound, Wallet } from "lucide-react";
import { roleLabel, useEcoStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/submit", label: "Submit", icon: Recycle },
  { to: "/market", label: "Market", icon: Store },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sessionUserId = useEcoStore((s) => s.sessionUserId);
  const users = useEcoStore((s) => s.users);
  const logout = useEcoStore((s) => s.logout);
  const user = users.find((u) => u.id === sessionUserId);
  const staff = user?.role === "ADMIN" || user?.role === "COLLECTION_AGENT";

  return (
    <div className="min-h-dvh bg-bg">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border bg-surface p-5 md:flex">
        <Link to="/home" className="mb-8 flex items-center gap-2 text-fg">
          <Leaf className="size-5 text-primary" />
          <span className="font-display text-xl font-medium">EcoCredits</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} {...item} active={pathname === item.to} />
          ))}
          {staff ? (
            <NavLink
              to="/admin"
              label="Operations"
              icon={Shield}
              active={pathname === "/admin"}
            />
          ) : null}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <p className="truncate text-sm font-medium">{user?.fullName}</p>
          <p className="text-xs text-muted">{user ? roleLabel(user.role) : ""}</p>
          <Button variant="ghost" className="mt-2 w-full justify-start" onClick={logout}>
            <LogOut /> Sign out
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <Leaf className="size-5 text-primary" />
          <span className="font-display text-lg">{user?.fullName ?? "EcoCredits"}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
          <LogOut />
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 md:ml-60 md:max-w-4xl md:pb-10">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-xs",
                active ? "text-primary" : "text-muted",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium",
        active ? "bg-elevated text-primary" : "text-muted hover:bg-elevated hover:text-fg",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useEcoStore((s) => s.sessionUserId);
  if (!session) return <Navigate to="/" />;
  return <AppShell>{children}</AppShell>;
}
