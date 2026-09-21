"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useEcoStore } from "@/lib/store";

export function StoreHydrate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      setReady(true);
    };
    const unsub = useEcoStore.persist.onFinishHydration(finish);
    void useEcoStore.persist.rehydrate();
    const t = window.setTimeout(finish, 80);
    return () => {
      cancelled = true;
      unsub();
      window.clearTimeout(t);
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-muted">
        <p className="font-display text-lg">EcoCredits</p>
      </div>
    );
  }

  return children;
}
