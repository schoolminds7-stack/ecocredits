import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { refreshEcoData } from "@/lib/server-actions";
import { useEcoStore } from "@/lib/store";
import type { Role, User } from "@/lib/types";

type Profile = { id: string; full_name: string | null; phone: string | null; role: Role; status: string };
type AuthContextValue = {
  session: Session | null; user: AuthUser | null; profile: Profile | null;
  loading: boolean; error: string | null;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (fullName: string, phone: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);
function normalizePhone(value: string) {
  const digits = value.trim().replace(/\s+/g, "");
  return digits.startsWith("+") ? digits : `+91${digits}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function syncProfile(authUser: AuthUser | null) {
    if (!authUser) { setProfile(null); useEcoStore.setState({ sessionUserId: null }); return; }
    const { data, error: profileError } = await supabase.from("profiles")
      .select("id,full_name,phone,role,status").eq("id", authUser.id).maybeSingle();
    if (profileError) throw profileError;
    let row = data as Profile | null;
    if (!row) {
      const { data: inserted, error: insertError } = await supabase.from("profiles")
        .insert({ id: authUser.id, full_name: String(authUser.user_metadata?.full_name ?? "EcoCredits User"),
          phone: authUser.phone ?? null, role: "USER", status: "ACTIVE" })
        .select("id,full_name,phone,role,status").single();
      if (insertError) throw insertError;
      row = inserted as Profile;
    }
    if (row.status !== "ACTIVE") {
      await supabase.auth.signOut();
      throw new Error("This account is not active. Contact EcoCredits support.");
    }
    setProfile(row);
    const appUser: User = { id: row.id, fullName: row.full_name || "EcoCredits User",
      phone: row.phone || authUser.phone || "", password: "", role: row.role, status: "ACTIVE" };
    const current = useEcoStore.getState();
    useEcoStore.setState({
      users: [appUser, ...current.users.filter((u) => u.id !== appUser.id)],
      wallets: current.wallets.some((w) => w.userId === appUser.id) ? current.wallets :
        [...current.wallets, { userId: appUser.id, availableBalance: 0, lockedBalance: 0 }],
      sessionUserId: appUser.id,
    });
  }

  useEffect(() => {
    let alive = true;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      queueMicrotask(() => {
        if (!alive) return;
        void syncProfile(nextSession?.user ?? null)
          .catch((e) => setError(e instanceof Error ? e.message : "Could not load profile."))
          .finally(() => alive && setLoading(false));
      });
    });
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      return syncProfile(data.session?.user ?? null)
        .catch((e) => setError(e instanceof Error ? e.message : "Could not load profile."))
        .finally(() => alive && setLoading(false));
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session, user: session?.user && profile ? session.user : null, profile, loading, error,
    signIn: async (phone, password) => {
      setError(null);
      const { error: authError } = await supabase.auth.signInWithPassword({ phone: normalizePhone(phone), password });
      if (authError) throw authError;
    },
    signUp: async (fullName, phone, password) => {
      setError(null);
      const { data, error: authError } = await supabase.auth.signUp({
        phone: normalizePhone(phone), password, options: { data: { full_name: fullName.trim() } },
      });
      if (authError) throw authError;
      return !data.session;
    },
    signOut: async () => {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      setSession(null); setProfile(null); useEcoStore.setState({ sessionUserId: null });
    },
  }), [session, profile, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
