import type { WasteStatus } from "./types";

export function statusTone(status: WasteStatus): "neutral" | "good" | "warn" | "bad" {
  if (status === "CREDITED") return "good";
  if (status === "REJECTED") return "bad";
  if (status === "SCHEDULED") return "warn";
  return "neutral";
}
