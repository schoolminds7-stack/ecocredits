import { createRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { Leaf } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/provider";

export const Route = createRoute({ getParentRoute: () => rootRoute, path: "/", component: LoginPage });
function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); const [notice, setNotice] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  if (loading) return <div className="flex min-h-dvh items-center justify-center text-muted">Loading EcoCredits…</div>;
  if (user) return <Navigate to="/home" />;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null); setNotice(null);
    try {
      if (mode === "register") {
        const confirm = await signUp(name, phone, password);
        if (confirm) setNotice("Account created. Verify your phone in Supabase, then sign in.");
        else void navigate({ to: "/home" });
      } else { await signIn(phone, password); void navigate({ to: "/home" }); }
    } catch (err) { setError(err instanceof Error ? err.message : "Authentication failed."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:px-10">
    <section className="hidden md:block"><p className="mb-4 inline-flex items-center gap-2 text-sm text-muted"><Leaf className="size-4 text-primary" /> Recycle · Credit · Redeem</p>
      <h1 className="font-display text-5xl font-medium leading-tight tracking-tight text-fg md:text-6xl">Turn recyclable waste into everyday value.</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted">Verified recyclable materials become EcoCredits you can spend on household essentials.</p></section>
    <section className="mx-auto w-full max-w-md pb-16"><div className="mb-8 flex items-center gap-2 md:hidden"><Leaf className="size-7 text-primary" /><div><p className="font-display text-2xl">EcoCredits</p><p className="text-sm text-muted">Turn waste into everyday value.</p></div></div>
      <form onSubmit={submit} className="rounded-[calc(var(--radius-xl)+12px)] border border-border bg-surface p-6">
        <h2 className="font-display text-2xl font-medium">{mode === "login" ? "Sign in" : "Create account"}</h2>
        <p className="mt-1 text-sm text-muted">{mode === "login" ? "Sign in with your mobile number and password." : "Create a household account. Staff roles are assigned by an administrator."}</p>
        <div className="mt-5 space-y-3">{mode === "register" && <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></Field>}
          <Field label="Mobile number"><Input inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" required /></Field>
          <Field label="Password"><Input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></Field></div>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}{notice && <p className="mt-3 text-sm text-primary">{notice}</p>}
        <Button type="submit" className="mt-5 w-full" size="lg" disabled={busy}>{busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</Button>
        <button type="button" className="mt-3 w-full text-center text-sm text-muted hover:text-fg" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setNotice(null); }}>{mode === "login" ? "New to EcoCredits? Create account" : "Already have an account? Sign in"}</button>
      </form></section></main>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-1.5"><Label>{label}</Label>{children}</div>; }
