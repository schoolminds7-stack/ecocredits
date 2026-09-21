import { money } from "@/lib/utils";

export function CreditCard({
  balance,
  locked,
}: {
  balance: number;
  locked?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-linear-to-br from-card-from to-card-to p-6 text-fg">
      <p className="text-sm text-fg/70">Available EcoCredits</p>
      <p className="mt-2 font-display text-5xl font-medium tracking-tight tabular-nums">
        {money(balance)}
      </p>
      <p className="mt-3 max-w-sm text-sm text-fg/65">
        Credits sit in your wallet until a merchant completes a redemption.
      </p>
      {locked && locked > 0 ? (
        <p className="mt-4 text-xs text-fg/55 tabular-nums">
          {money(locked)} currently locked on pending redemptions
        </p>
      ) : null}
    </div>
  );
}
