"use client";

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { RequireAuth } from "@/components/app-shell";
import { CreditCard } from "@/components/credit-card";
import { Card } from "@/components/ui/card";
import { useEcoStore } from "@/lib/store";
import { money } from "@/lib/utils";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: Page,
});

function Page() {
  return (
    <RequireAuth>
      <WalletView />
    </RequireAuth>
  );
}

function WalletView() {
  const userId = useEcoStore((s) => s.sessionUserId)!;
  const wallets = useEcoStore((s) => s.wallets);
  const ledger = useEcoStore((s) => s.ledger);
  const wallet = wallets.find((w) => w.userId === userId)!;
  const mine = ledger.filter((l) => l.userId === userId);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-medium">Wallet</h1>
      <CreditCard balance={wallet.availableBalance} locked={wallet.lockedBalance} />
      <section>
        <h2 className="mb-3 font-display text-xl">Ledger</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-muted">No movements yet.</p>
        ) : (
          <div className="space-y-2">
            {mine.map((x) => {
              const positive = x.amount >= 0;
              return (
                <Card key={x.id} className="flex items-center gap-3 p-3">
                  <div className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-elevated text-primary">
                    {positive ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{x.transactionType.replaceAll("_", " ")}</p>
                    <p className="text-xs text-muted">
                      {new Date(x.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-mono text-sm tabular-nums">
                    {positive ? "+" : ""}
                    {money(x.amount)}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
