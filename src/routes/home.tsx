"use client";

import { createRoute, Link } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { Recycle, ShoppingBasket } from "lucide-react";
import { RequireAuth } from "@/components/app-shell";
import { CreditCard } from "@/components/credit-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEcoStore } from "@/lib/store";
import { money } from "@/lib/utils";
import { statusTone } from "@/lib/status";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: HomePage,
});

function HomePage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const userId = useEcoStore((s) => s.sessionUserId)!;
  const users = useEcoStore((s) => s.users);
  const wallets = useEcoStore((s) => s.wallets);
  const categories = useEcoStore((s) => s.categories);
  const products = useEcoStore((s) => s.products);
  const submissions = useEcoStore((s) => s.submissions);
  const user = users.find((u) => u.id === userId)!;
  const wallet = wallets.find((w) => w.userId === userId)!;
  const mine = submissions.filter((x) => x.userId === userId);
  const staff = user.role === "ADMIN" || user.role === "COLLECTION_AGENT";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted">Welcome back</p>
        <h1 className="font-display text-3xl font-medium tracking-tight">{user.fullName}</h1>
      </header>

      <CreditCard balance={wallet.availableBalance} locked={wallet.lockedBalance} />

      {staff ? (
        <Link
          to="/admin"
          className="block rounded-[var(--radius-lg)] border border-border bg-elevated px-4 py-3 text-sm"
        >
          Open operations desk — verify drop-offs and review rates
        </Link>
      ) : null}

      <section>
        <h2 className="mb-3 font-display text-xl">Recent submissions</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-muted">No submissions yet. Start with a drop-off.</p>
        ) : (
          <div className="space-y-2">
            {mine.slice(0, 5).map((s) => {
              const cat = categories.find((c) => c.id === s.categoryId);
              return (
                <Card key={s.id} className="flex items-center gap-3 p-3">
                  <div className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-elevated text-primary">
                    <Recycle className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {cat?.name ?? "Waste"} · {s.estimatedWeight} kg
                    </p>
                    <p className="text-xs text-muted">
                      {s.finalCredits != null ? `${money(s.finalCredits)} credits` : "Awaiting verification"}
                    </p>
                  </div>
                  <Badge tone={statusTone(s.status)}>{s.status.replace("_", " ")}</Badge>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl">Essential marketplace</h2>
          <Link to="/market" className="text-sm text-primary">
            See all
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {products.slice(0, 4).map((p) => (
            <Card key={p.id} className="flex items-center gap-3 p-3">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-elevated text-primary">
                <ShoppingBasket className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted tabular-nums">{p.creditPrice} EcoCredits</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
