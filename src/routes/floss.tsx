"use client";

import { createRoute, Link } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { Leaf, Sparkles } from "lucide-react";
import { FLOSS, FLOSS_LOAD, FLOSS_RULES, FLOSS_SITES, FLOSS_STEPS } from "@/lib/floss";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/floss",
  component: FlossPage,
});

function FlossPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-8">
      <header className="flex items-start gap-3">
        <Sparkles className="mt-1 size-6 text-primary" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Floss line</p>
          <h1 className="font-display text-3xl text-fg">{FLOSS.name}</h1>
          <p className="mt-2 text-muted">{FLOSS.tagline}</p>
          <p className="mt-2 text-sm text-fg">{FLOSS.note}</p>
        </div>
      </header>

      <section>
        <h2 className="mb-3 font-display text-xl">Ward lines</h2>
        <div className="grid gap-3">
          {FLOSS_SITES.map((site) => (
            <article key={site.id} className="rounded-[var(--radius-lg)] border border-border bg-surface/80 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">{site.ward}</p>
              <p className="mt-1 font-medium text-fg">{site.place}</p>
              <p className="mt-1 text-sm text-fg">{site.hours}</p>
              <p className="mt-1 text-sm text-muted">{site.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl">What the line takes</h2>
        <div className="grid gap-3">
          {FLOSS_LOAD.map((row) => (
            <article key={row.item} className="rounded-[var(--radius-lg)] border border-border bg-surface/80 px-5 py-4">
              <p className="font-medium text-fg">{row.item}</p>
              <p className="mt-1 text-sm text-fg">Keep: {row.keep}</p>
              <p className="mt-1 text-sm text-muted">Leave: {row.skip}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl">Before the window</h2>
        <ol className="grid gap-3">
          {FLOSS_STEPS.map((step) => (
            <li key={step.n} className="rounded-[var(--radius-lg)] border border-border bg-surface/80 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">{step.n}</p>
              <p className="mt-1 font-medium text-fg">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl">Line rules</h2>
        <ul className="grid gap-2">
          {FLOSS_RULES.map((rule) => (
            <li key={rule} className="rounded-[var(--radius-lg)] border border-border bg-surface/80 px-5 py-3 text-sm text-fg">
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-muted">
        <Leaf className="mr-1 inline size-4 text-primary" />
        Credits still wait on the shade scale. Dry floss is a sort, not a receipt.{" "}
        <Link to="/path" className="text-primary hover:underline">
          Green path
        </Link>
        {" · "}
        <Link to="/paste" className="text-primary hover:underline">
          Paste line
        </Link>
        {" · "}
        <Link to="/tooth" className="text-primary hover:underline">
          Tooth line
        </Link>
      </p>
    </div>
  );
}
