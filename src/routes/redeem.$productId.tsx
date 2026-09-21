"use client";

import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState } from "react";
import { RequireAuth } from "@/components/app-shell";
import { QrStamp } from "@/components/qr-stamp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEcoStore } from "@/lib/store";
import type { Redemption } from "@/lib/types";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/redeem/$productId",
  component: Page,
});

function Page() {
  return (
    <RequireAuth>
      <Checkout />
    </RequireAuth>
  );
}

function Checkout() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const products = useEcoStore((s) => s.products);
  const redeem = useEcoStore((s) => s.redeem);
  const complete = useEcoStore((s) => s.completeRedemption);
  const cancel = useEcoStore((s) => s.cancelRedemption);
  const product = products.find((p) => p.id === productId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Redemption | null>(null);
  const [otp, setOtp] = useState("");

  if (!product) {
    return <p className="text-sm text-muted">That product is no longer listed.</p>;
  }

  if (result) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-medium">Redemption token</h1>
        <p className="text-sm text-muted">
          Show this stamp to the authorized merchant. Credits stay locked until the OTP is confirmed.
        </p>
        <div className="flex justify-center">
          <QrStamp token={result.token} />
        </div>
        <p className="break-all text-center font-mono text-xs text-muted">{result.token}</p>
        <Card className="space-y-3 p-4">
          <p className="text-sm">
            Demo merchant OTP:{" "}
            <span className="font-mono text-primary">{result.otp}</span>
          </p>
          <div className="grid gap-1.5">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setError(null);
              try {
                complete(result.id, otp);
                void navigate({ to: "/wallet" });
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not complete.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Verifying…" : "Complete redemption"}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setError(null);
              try {
                cancel(result.id);
                void navigate({ to: "/market" });
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not cancel.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Cancel & unlock credits
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-medium">Redemption checkout</h1>
      <Card className="p-4">
        <p className="font-medium">{product.name}</p>
        <p className="text-sm text-muted">{product.blurb}</p>
        <p className="mt-2 font-mono text-sm tabular-nums">{product.creditPrice} EcoCredits</p>
      </Card>
      <p className="text-sm text-muted">
        Credits will be locked while this redemption is pending, then released from lock when the merchant confirms.
      </p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button
        size="lg"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError(null);
          try {
            setResult(redeem(product.id));
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not redeem.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Processing…" : "Lock credits & generate token"}
      </Button>
    </div>
  );
}
