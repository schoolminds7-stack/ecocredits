"use client";

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roleLabel, useEcoStore } from "@/lib/store";
import { statusTone } from "@/lib/status";
import type { QualityGrade, Role } from "@/lib/types";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Page,
});

function Page() {
  return (
    <RequireAuth>
      <AdminDesk />
    </RequireAuth>
  );
}

function AdminDesk() {
  const sessionUserId = useEcoStore((s) => s.sessionUserId)!;
  const users = useEcoStore((s) => s.users);
  const categories = useEcoStore((s) => s.categories);
  const products = useEcoStore((s) => s.products);
  const submissions = useEcoStore((s) => s.submissions);
  const verify = useEcoStore((s) => s.verifySubmission);
  const reject = useEcoStore((s) => s.rejectSubmission);
  const updateRate = useEcoStore((s) => s.updateRate);
  const setCategoryActive = useEcoStore((s) => s.setCategoryActive);
  const updateUserRole = useEcoStore((s) => s.updateUserRole);
  const updateProduct = useEcoStore((s) => s.updateProduct);
  const user = users.find((u) => u.id === sessionUserId)!;
  const pending = submissions.filter(
    (s) => s.status === "CREATED" || s.status === "SCHEDULED",
  );
  const staff = user.role === "ADMIN" || user.role === "COLLECTION_AGENT";
  const [userQuery, setUserQuery] = useState("");
  const [roleMsg, setRoleMsg] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        roleLabel(u.role).toLowerCase().includes(q),
    );
  }, [users, userQuery]);

  if (!staff) {
    return (
      <p className="text-sm text-muted">
        Operations is limited to collection agents and administrators.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-medium">Operations</h1>
        <p className="mt-1 text-sm text-muted">
          Verify drop-offs, manage people and rates, and keep the marketplace stocked.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat n={users.length} l="People" />
        <Stat n={categories.filter((c) => c.active).length} l="Materials" />
        <Stat n={pending.length} l="Pending" />
        <Stat n={products.filter((p) => p.active).length} l="Products" />
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl">Pending verification</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">Nothing waiting.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((s) => (
              <VerifyRow
                key={s.id}
                id={s.id}
                name={users.find((u) => u.id === s.userId)?.fullName ?? "Household"}
                material={categories.find((c) => c.id === s.categoryId)?.name ?? "Waste"}
                weight={s.estimatedWeight}
                method={s.collectionMethod}
                address={s.pickupAddress}
                onVerify={(w, g) => verify(s.id, w, g)}
                onReject={() => reject(s.id)}
              />
            ))}
          </div>
        )}
      </section>

      {user.role === "ADMIN" ? (
        <>
          <section>
            <h2 className="mb-3 font-display text-xl">People & roles</h2>
            <p className="mb-3 text-sm text-muted">
              Promote a household to collection agent or administrator. Only admins can
              change roles. The last admin cannot be demoted.
            </p>
            <Input
              className="mb-3 max-w-sm"
              placeholder="Search by name, phone, or role…"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
            {roleMsg ? <p className="mb-2 text-sm text-muted">{roleMsg}</p> : null}
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <Card
                  key={u.id}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {u.fullName}
                      {u.id === sessionUserId ? (
                        <span className="ml-2 text-xs text-muted">(you)</span>
                      ) : null}
                    </p>
                    <p className="font-mono text-xs text-muted">{u.phone}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{roleLabel(u.role)}</Badge>
                    <select
                      value={u.role}
                      disabled={u.id === sessionUserId}
                      onChange={(e) => {
                        setRoleMsg(null);
                        try {
                          updateUserRole(u.id, e.target.value as Role);
                          setRoleMsg(
                            `Updated ${u.fullName} to ${roleLabel(e.target.value as Role)}.`,
                          );
                        } catch (err) {
                          setRoleMsg(
                            err instanceof Error ? err.message : "Could not update role.",
                          );
                        }
                      }}
                      className="h-10 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-sm disabled:opacity-50"
                      aria-label={`Role for ${u.fullName}`}
                    >
                      <option value="USER">Household</option>
                      <option value="COLLECTION_AGENT">Collection agent</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl">Credit rates & materials</h2>
            <div className="space-y-2">
              {categories.map((c) => (
                <RateRow
                  key={c.id}
                  name={c.name}
                  value={c.creditPerKg}
                  active={c.active}
                  onSave={(v) => updateRate(c.id, v)}
                  onToggle={(active) => setCategoryActive(c.id, active)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl">Marketplace stock</h2>
            <div className="space-y-2">
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  name={p.name}
                  price={p.creditPrice}
                  stock={p.stockQuantity}
                  active={p.active}
                  onSave={(price, stock, active) =>
                    updateProduct(p.id, {
                      creditPrice: price,
                      stockQuantity: stock,
                      active,
                    })
                  }
                />
              ))}
            </div>
          </section>
        </>
      ) : null}

      <section>
        <h2 className="mb-3 font-display text-xl">All submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-muted">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => (
              <Card key={s.id} className="flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-medium">
                    {categories.find((c) => c.id === s.categoryId)?.name} · {s.estimatedWeight} kg
                    {s.finalCredits != null ? ` · ${s.finalCredits} credits` : ""}
                  </p>
                  <p className="text-xs text-muted">
                    {users.find((u) => u.id === s.userId)?.fullName} ·{" "}
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge tone={statusTone(s.status)}>{s.status.replace("_", " ")}</Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <p className="font-display text-2xl tabular-nums">{n}</p>
      <p className="text-xs text-muted">{l}</p>
    </div>
  );
}

function VerifyRow({
  id,
  name,
  material,
  weight,
  method,
  address,
  onVerify,
  onReject,
}: {
  id: string;
  name: string;
  material: string;
  weight: number;
  method: string;
  address: string | null;
  onVerify: (w: number, g: QualityGrade) => void;
  onReject: () => void;
}) {
  const [w, setW] = useState(String(weight));
  const [g, setG] = useState<QualityGrade>("GRADE_B");
  const [err, setErr] = useState<string | null>(null);
  return (
    <Card className="space-y-3 p-4">
      <div>
        <p className="font-medium">
          {material} · {weight} kg est.
        </p>
        <p className="text-xs text-muted">
          {name} · {method.replace("_", " ").toLowerCase()}
          {address ? ` · ${address}` : ""} · {id}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        <div className="grid gap-1">
          <Label className="text-xs">Verified kg</Label>
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={w}
            onChange={(e) => setW(e.target.value)}
            aria-label="Verified weight"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Grade</Label>
          <select
            value={g}
            onChange={(e) => setG(e.target.value as QualityGrade)}
            className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
          >
            <option value="GRADE_A">Grade A</option>
            <option value="GRADE_B">Grade B</option>
            <option value="GRADE_C">Grade C</option>
          </select>
        </div>
        <Button
          className="sm:mt-5"
          onClick={() => {
            setErr(null);
            try {
              onVerify(Number(w), g);
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Verify & credit
        </Button>
        <Button
          className="sm:mt-5"
          variant="outline"
          onClick={() => {
            setErr(null);
            try {
              onReject();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Reject
        </Button>
      </div>
      {err ? <p className="text-sm text-danger">{err}</p> : null}
    </Card>
  );
}

function RateRow({
  name,
  value,
  active,
  onSave,
  onToggle,
}: {
  name: string;
  value: number;
  active: boolean;
  onSave: (v: number) => void;
  onToggle: (active: boolean) => void;
}) {
  const [v, setV] = useState(String(value));
  return (
    <Card className="flex flex-wrap items-center gap-3 p-3">
      <p className="min-w-24 flex-1 text-sm font-medium">{name}</p>
      <Badge tone={active ? "good" : "neutral">{active ? "Active" : "Off"}</Badge>
      <Input
        className="max-w-28"
        type="number"
        min={0}
        value={v}
        onChange={(e) => setV(e.target.value)}
        aria-label={`${name} rate`}
      />
      <Button size="sm" variant="secondary" onClick={() => onSave(Number(v))}>
        Save rate
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onToggle(!active)}>
        {active ? "Disable" : "Enable"}
      </Button>
    </Card>
  );
}

function ProductRow({
  name,
  price,
  stock,
  active,
  onSave,
}: {
  name: string;
  price: number;
  stock: number;
  active: boolean;
  onSave: (price: number, stock: number, active: boolean) => void;
}) {
  const [p, setP] = useState(String(price));
  const [s, setS] = useState(String(stock));
  const [a, setA] = useState(active);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <Card className="space-y-2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{name}</p>
        <Badge tone={a ? "good" : "neutral">{a ? "Listed" : "Hidden"}</Badge>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1">
          <Label className="text-xs">Credits</Label>
          <Input
            className="w-24"
            type="number"
            min={0}
            value={p}
            onChange={(e) => setP(e.target.value)}
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Stock</Label>
          <Input
            className="w-24"
            type="number"
            min={0}
            value={s}
            onChange={(e) => setS(e.target.value)}
          />
        </div>
        <label className="flex h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={a}
            onChange={(e) => setA(e.target.checked)}
            className="accent-primary"
          />
          Active
        </label>
        <Button
          size="sm"
          onClick={() => {
            setMsg(null);
            try {
              onSave(Number(p), Number(s), a);
              setMsg("Saved.");
            } catch (e) {
              setMsg(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Save
        </Button>
      </div>
      {msg ? <p className="text-xs text-muted">{msg}</p> : null}
    </Card>
  );
}
