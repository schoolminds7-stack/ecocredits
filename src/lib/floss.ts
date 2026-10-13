export const FLOSS = {
  name: "Floss line",
  tagline: "Dry school floss containers for the ward floss line — school floss, travel floss, family floss, spare container.",
  note: "Four ward lines on loop mornings. Cap the container and keep the seal clear. Credits wait until staff accept the dry floss — never a damp monsoon container or a wet string.",
} as const;

export const FLOSS_SITES = [
  {
    id: "gachi",
    ward: "Gachibowli",
    place: "Botanical garden wash-room floss rack",
    hours: "Walk-in 09:00–12:00 Mon · Wed · Fri",
    note: "Same morning as the society crate. The floss line does not hold damp containers at the gate.",
  },
  {
    id: "madha",
    ward: "Madhapur",
    place: "Ayyappa society office floss stand",
    hours: "Walk-in 09:00–12:00 Tue · Thu · Sat",
    note: "Dry containers only. A monsoon-damp floss waits until the cap is clear.",
  },
  {
    id: "konda",
    ward: "Kondapur",
    place: "Kondapur main-road hall floss line",
    hours: "Walk-in 09:00–12:00 Mon · Wed · Fri",
    note: "Dry them before the window. Staff do not sort a damp container from the bag.",
  },
  {
    id: "mani",
    ward: "Manikonda",
    place: "Alkapur township classroom floss rail",
    hours: "Walk-in 09:30–12:30 Tue · Thu · Sat",
    note: "Society floss points to the line. Households do not mix containers with pastes or brushes.",
  },
] as const;

export const FLOSS_LOAD = [
  {
    item: "School floss",
    keep: "Cap the container and keep the seal clear. Travel it so the floss is dry, not soft.",
    skip: "Containers still filmed with monsoon damp, or a paste tube that belongs on another line.",
  },
  {
    item: "Travel floss",
    keep: "Cap the case and keep the seal clear. Stand it so staff see one dry travel floss.",
    skip: "Travel floss still soft from rain, or a wet case that belongs on the shelf.",
  },
  {
    item: "Family floss",
    keep: "Cap the container and keep the neck clear. Travel it so staff can see the string is dry, not wet.",
    skip: "Family floss still holding rain, or a toothbrush that belongs on the tooth line.",
  },
  {
    item: "Spare container",
    keep: "Cap the container and keep the seal clear. Carry it only if the plastic is light.",
    skip: "Spare containers still rain-wet, or a soap that belongs on the soap line.",
  },
] as const;

export const FLOSS_STEPS = [
  {
    n: "01",
    title: "Dry the floss before the loop",
    body: "Rain, wet hands, and a damp string come off first. Containers that still smell of monsoon wait on the shelf, not on the line.",
  },
  {
    n: "02",
    title: "Carry it to the ward line",
    body: "Four ward lines open on loop mornings. Do not mix floss with pastes or brushes. Staff take dry containers, not a soft string.",
  },
  {
    n: "03",
    title: "Wait for the receipt",
    body: "Credits follow the shade scale after staff accept the floss. A kerb drop, a damp container, or a self-count is not a credit.",
  },
] as const;

export const FLOSS_RULES = [
  "Dry school floss containers, travel floss, family floss and spare containers only.",
  "Cap the container and clear the seal before the window.",
  "No damp monsoon floss, wet string, or leaky case.",
  "Do not mix with toothbrushes, toothpaste, or mirrors.",
  "Credits wait on the shade scale — never a self-weigh or a kerb drop.",
] as const;
