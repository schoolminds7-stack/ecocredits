export const JUG = {
  name: "Jug line",
  tagline: "Dry school jugs for the ward jug line — steel jug, plastic jug, enamel jug, water jug.",
  note: "Four ward lines on loop mornings. Dry the jug and wipe the base and spout. Credits wait until staff accept the dry jug — never a damp monsoon base.",
} as const;

export const JUG_SITES = [
  {
    id: "gachi",
    ward: "Gachibowli",
    place: "Botanical garden sports-room jug rack",
    hours: "Walk-in 09:00–12:00 Mon · Wed · Fri",
    note: "Same morning as the society crate. The jug line does not hold damp bases at the gate.",
  },
  {
    id: "madha",
    ward: "Madhapur",
    place: "Ayyappa society office jug stand",
    hours: "Walk-in 09:00–12:00 Tue · Thu · Sat",
    note: "Dry jugs only. A monsoon-damp base waits until the foot is clear.",
  },
  {
    id: "konda",
    ward: "Kondapur",
    place: "Kondapur main-road hall jug line",
    hours: "Walk-in 09:00–12:00 Mon · Wed · Fri",
    note: "Wipe them dry before the window. Staff do not sort a damp jug from the bag.",
  },
  {
    id: "mani",
    ward: "Manikonda",
    place: "Alkapur township classroom jug rail",
    hours: "Walk-in 09:30–12:30 Tue · Thu · Sat",
    note: "Society jug points to the line. Households do not mix jugs with mugs or thermos.",
  },
] as const;

export const JUG_LOAD = [
  {
    item: "Steel jug",
    keep: "Dry the jug and wipe the base and spout. Travel it so the foot is clear, not beaded.",
    skip: "Jugs still filmed with monsoon damp, or a mug that belongs on the mug line.",
  },
  {
    item: "Plastic jug",
    keep: "Dry the jug and keep the base clear. Stand it so staff see one dry plastic jug.",
    skip: "Plastic jugs still soft from rain, or a bottle that belongs on the bottle line.",
  },
  {
    item: "Enamel jug",
    keep: "Dry the jug and keep the base and spout clear. Travel it so staff can see the foot is light, not wet.",
    skip: "Enamel jugs still holding rain, or a thermos that belongs on the thermos line.",
  },
  {
    item: "Water jug",
    keep: "Dry the jug and keep the spout clear. Carry it only if the base is light.",
    skip: "Jugs still rain-wet, or a saucer that belongs on the saucer line.",
  },
] as const;

export const JUG_STEPS = [
  {
    n: "01",
    title: "Dry the jug before the loop",
    body: "Rain, wet hands, and a damp base come off first. Jugs that still smell of monsoon wait on the shelf, not on the line.",
  },
  {
    n: "02",
    title: "Carry it to the ward line",
    body: "Four ward lines open on loop mornings. Do not mix jugs with mugs or thermos. Staff take dry bases, not a damp foot.",
  },
  {
    n: "03",
    title: "Wait for the receipt",
    body: "Credits follow the shade scale after staff accept the jug. A kerb drop, a damp base, or a self-count is not a credit.",
  },
] as const;

export const JUG_RULES = [
  "Dry school jugs, steel jugs, plastic jugs, and enamel or water jugs only.",
  "Dry the jug and wipe the base and spout before the window. Monsoon damp stays on the shelf.",
  "No self-credit for a damp base, a wet spout, or a jug still holding rain.",
  "Staff accept the dry load on the shade scale. The line is a sort, not a receipt.",
] as const;
