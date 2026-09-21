"use client";

import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState } from "react";
import { RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roleLabel, useEcoStore } from "@/lib/store";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Page,
});

function Page() {
  return (
    <RequireAuth>
      <ProfileView />
    </RequireAuth>
  );
}

function ProfileView() {
  const userId = useEcoStore((s) => s.sessionUserId)!;
  const users = useEcoStore((s) => s.users);
  const updateProfile = useEcoStore((s) => s.updateProfile);
  const changePassword = useEcoStore((s) => s.changePassword);
  const user = users.find((u) => u.id === userId)!;
  const [name, setName] = useState(user.fullName);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-medium">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          {roleLabel(user.role)} · {user.phone}
        </p>
      </header>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-xl">Display name</h2>
        <div className="grid gap-1.5 max-w-md">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button
          onClick={() => {
            setErr(null);
            setMsg(null);
            try {
              updateProfile(name);
              setMsg("Name updated.");
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Save name
        </Button>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-xl">Change password</h2>
        <div className="grid max-w-md gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="cur">Current password</Label>
            <Input
              id="cur"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              minLength={6}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cfm">Confirm new password</Label>
            <Input
              id="cfm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setErr(null);
            setMsg(null);
            if (next !== confirm) {
              setErr("New passwords do not match.");
              return;
            }
            try {
              changePassword(current, next);
              setCurrent("");
              setNext("");
              setConfirm("");
              setMsg("Password changed.");
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Update password
        </Button>
      </Card>

      {msg ? <p className="text-sm text-good">{msg}</p> : null}
      {err ? <p className="text-sm text-danger">{err}</p> : null}
    </div>
  );
}
