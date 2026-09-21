"use client";

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEcoStore } from "@/lib/store";
import type { CollectionMethod, QualityGrade } from "@/lib/types";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/submit",
  component: Page,
});

function Page() {
  return (
    <RequireAuth>
      <SubmitWaste />
    </RequireAuth>
  );
}

function SubmitWaste() {
  const categories = useEcoStore((s) => s.categories);
  const createSubmission = useEcoStore((s) => s.createSubmission);
  const active = useMemo(() => categories.filter((c) => c.active), [categories]);
  const [categoryId, setCategoryId] = useState(active[0]?.id ?? "");
  const [weight, setWeight] = useState(4);
  const [quality, setQuality] = useState<QualityGrade>("GRADE_B");
  const [method, setMethod] = useState<CollectionMethod>("COLLECTION_CENTER");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const selected = active.find((c) => c.id === categoryId);

  function submit() {
    setBusy(true);
    setMsg(null);
    try {
      createSubmission({
        categoryId,
        estimatedWeight: weight,
        collectionMethod: method,
        pickupAddress: address || null,
      });
      setMsg("Submission created. Final credits are calculated after verification.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not submit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-medium">Submit waste</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
          Choose material and estimated weight. Collection staff verify the load,
          apply the quality grade, and credit your wallet.
        </p>
      </header>

      <div className="grid gap-5 rounded-[calc(var(--radius-xl)+8px)] border border-border bg-surface p-5">
        <div className="grid gap-1.5">
          <Label htmlFor="cat">Waste category</Label>
          <select
            id="cat"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
          >
            {active.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.creditPerKg} credits / kg
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Estimated weight</Label>
            <span className="font-mono text-sm tabular-nums">{weight.toFixed(1)} kg</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            step={0.5}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-primary"
          />
          {selected ? (
            <p className="mt-2 text-xs text-muted">
              Indicative value ~{(weight * selected.creditPerKg).toFixed(0)} credits before quality
              adjustment. Grade A ×1.2, B ×1.0, C ×0.7.
            </p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="grade">Expected quality</Label>
          <select
            id="grade"
            value={quality}
            onChange={(e) => setQuality(e.target.value as QualityGrade)}
            className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
          >
            <option value="GRADE_A">Grade A — Clean</option>
            <option value="GRADE_B">Grade B — Minor contamination</option>
            <option value="GRADE_C">Grade C — Low quality</option>
          </select>
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium text-muted">Collection method</legend>
          {(
            [
              ["COLLECTION_CENTER", "Collection center"],
              ["HOME_PICKUP", "Home pickup"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
            >
              <input
                type="radio"
                name="method"
                checked={method === value}
                onChange={() => setMethod(value)}
                className="accent-primary"
              />
              {label}
            </label>
          ))}
        </fieldset>

        {method === "HOME_PICKUP" ? (
          <div className="grid gap-1.5">
            <Label htmlFor="addr">Pickup address</Label>
            <Input
              id="addr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, area, city"
            />
          </div>
        ) : null}

        {msg ? <p className="text-sm text-muted">{msg}</p> : null}

        <Button onClick={submit} disabled={busy || !categoryId} size="lg">
          {busy ? "Submitting…" : "Create submission"}
        </Button>
      </div>
    </div>
  );
}
