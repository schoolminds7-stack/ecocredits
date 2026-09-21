"use client";

import { createRoute, Link } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { ShoppingBasket } from "lucide-react";
import { RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEcoStore } from "@/lib/store";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/market",
  component: Page,
});

function Page() {
  return (
    <RequireAuth>
      <Market />
    </RequireAuth>
  );
}

function Market() {
  const products = useEcoStore((s) => s.products);
  const wallets = useEcoStore((s) => s.wallets);
  const userId = useEcoStore((s) => s.sessionUserId);
  const wallet = wallets.find((w) => w.userId === userId);
  const listed = products.filter((p) => p.active);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-medium">Essential marketplace</h1>
        <p className="mt-1 text-sm text-muted">
          Spend EcoCredits on household staples. Stock is reserved when you lock a token.
        </p>
      </header>
      <div className="grid gap-3">
        {listed.map((p) => {
          const can = (wallet?.availableBalance ?? 0) >= p.creditPrice && p.stockQuantity > 0;
          return (
            <Card key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-elevated text-primary">
                <ShoppingBasket className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted">{p.blurb}</p>
                <p className="mt-1 text-xs text-subtle tabular-nums">
                  {p.creditPrice} EcoCredits · Stock {p.stockQuantity}
                </p>
              </div>
              {can ? (
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/redeem/$productId" params={{ productId: p.id }}>
                    Redeem
                  </Link>
                </Button>
              ) : (
                <Button disabled className="w-full sm:w-auto">
                  Redeem
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
