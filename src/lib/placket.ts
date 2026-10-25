export const PLACKET = {
  name: "Placket line",
  tagline: "Dry school plackets for the ward placket line — school placket, house placket, PE placket, spare placket.",
  note: "Four ward lines on loop mornings. Dry the placket and keep the edge clear. Credits wait until staff accept the dry placket — never a damp monsoon edge.",
} as const;

export const PLACKET_SITES = [
  {
    id: "gachi",
    ward: "Gachibowli",
    place: "Botanical garden uniform-room placket rail",
    hours: "Walk-in 09:00–12:00 Mon · Wed · Fri",
    note: "Same morning as the society crate. The placket line does not hold damp edges at the gate.",
  },
  {
    id: "madha",
    ward: "Madhapur",
    place: "Ayyappa society office placket stand",
    hours: "Walk-in 09:00–12:00 Tue · Thu · Sat",
    note: "Dry plackets only. A monsoon-damp edge waits until the fold is clear.",
  },
  {
    id: "konda",
    ward: "Kondapur",
    place: "Kondapur main-road hall placket line",
    hours: "Walk-in 09:00–12:00 Mon · Wed · Fri",
    note: "Dry them before the window. Staff do not sort a damp placket from the bag.",
  },
  {
    id: "mani",
    ward: "Manikonda",
    place: "Alkapur township classroom placket rail",
    hours: "Walk-in 09:30–12:30 Tue · Thu · Sat",
    note: "Society placket points to the line. Households do not mix plackets with collars or cuffs.",
  },
] as const;

export const PLACKET_LOAD = [
  {
    item: "School placket",
    keep: "Dry the placket and keep the edge clear. Travel it so the fold is light, not damp.",
    skip: "Plackets still filmed with monsoon damp, or a collar that belongs on the collar line.",
  },
  {
    item: "House placket",
    keep: "Dry the placket and keep the edge clear. Stand it so staff see one dry house placket.",
    skip: "House plackets still soft from rain, or a shirt that belongs on the shirt line.",
  },
  {
    item: "PE placket",
    keep: "Dry the placket and keep the edge clear. Travel it so staff can see the fold is dry, not wet.",
    skip: "PE plackets still holding rain, or a jersey that belongs on the jersey line.",
  },
  {
    item: "Spare placket",
    keep: "Dry the placket and keep the edge clear. Carry it only if the cloth is light.",
    skip: "Spare plackets still rain-wet, or a cuff that belongs on the cuff line.",
  },
] as const;

export const PLACKET_STEPS = [
  {
    n: "01",
    title: "Dry the placket before the loop",
    body: "Rain, wet hands, and a damp edge come off first. Plackets that still smell of monsoon wait on the shelf, not on the line.",
  },
  {
    n: "02",
    title: "Carry it to the ward line",
    body: "Four ward lines open on loop mornings. Do not mix plackets with collars or cuffs. Staff take dry edges, not a damp fold.",
  },
  {
    n: "03",
    title: "Wait for the receipt",
    body: "Credits follow the shade scale after staff accept the placket. A kerb drop, a damp edge, or a self-count is not a credit.",
  },
] as const;

export const PLACKET_RULES = [
  "Dry school plackets, house plackets, PE plackets and spare plackets only.",
  "Dry the placket and clear the edge before the window.",
  "No damp monsoon placket, wet fold, or soft edge.",
  "Do not mix with collars, cuffs, or hems.",
  "Credits wait on the shade scale — never a self-weigh or a kerb drop.",
] as const;
