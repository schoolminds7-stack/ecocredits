import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-border bg-surface p-4 text-fg",
        className,
      )}
      {...props}
    />
  );
}
