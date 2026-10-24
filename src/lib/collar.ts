export const COLLAR = {
  name: "Collar line",
  tagline: "Dry school collars for the ward collar line — school collar, house collar, PE collar, spare collar.",
  note: "Four ward lines on loop mornings. Dry the collar and keep the edge clear. Credits wait until staff accept the dry collar — never a damp monsoon edge.",
} as const;

export const COLLAR_SITES = [
  {
    id: "gachi",
    ward: "Gachibowli",
    place: "Botanical garden uniform-room collar rail",
    hours: "Walk-in 09:00–12:00 Mon · Wed · Fri",
    note: "Same morning as the society crate. The collar line does not hold damp edges at the gate.",
  },
  {
    id: "madha",
    ward: "Madhapur",
    place: "Ayyappa society office collar stand",
    hours: "Walk-in 09:00–12:00 Tue · Thu · Sat",
    note: "Dry collars only. A monsoon-damp edge waits until the fold is clear.",
  },
  {
    id: "konda",
    ward: "Kondapur",
    place: "Kondapur main-road hall collar line",
    hours: "Walk-in 09:00–12:00 Mon · Wed · Fri",
    note: "Dry them before the window. Staff do not sort a damp collar from the bag.",
  },
  {
    id: "mani",
    ward: "Manikonda",
    place: "Alkapur township classroom collar rail",
    hours: "Walk-in 09:30–12:30 Tue · Thu · Sat",
    note: "Society collar points to the line. Households do not mix collars with cuffs or hems.",
  },
] as const;

export const COLLAR_LOAD = [
  {
    item: "School collar",
    keep: "Dry the collar and keep the edge clear. Travel it so the fold is light, not damp.",
    skip: "Collars still filmed with monsoon damp, or a cuff that belongs on the cuff line.",
  },
  {
    item: "House collar",
    keep: "Dry the collar and keep the edge clear. Stand it so staff see one dry house collar.",
    skip: "House collars still soft from rain, or a shirt that belongs on the shirt line.",
  },
  {
    item: "PE collar",
    keep: "Dry the collar and keep the edge clear. Travel it so staff can see the fold is dry, not wet.",
    skip: "PE collars still holding rain, or a jersey that belongs on the jersey line.",
  },
  {
    item: "Spare collar",
    keep: "Dry the collar and keep the edge clear. Carry it only if the cloth is light.",
    skip: "Spare collars still rain-wet, or a placket that belongs on the placket line.",
  },
] as const;

export const COLLAR_STEPS = [
  {
    n: "01",
    title: "Dry the collar before the loop",
    body: "Rain, wet hands, and a damp edge come off first. Collars that still smell of monsoon wait on the shelf, not on the line.",
  },
  {
    n: "02",
    title: "Carry it to the ward line",
    body: "Four ward lines open on loop mornings. Do not mix collars with cuffs or hems. Staff take dry edges, not a damp fold.",
  },
  {
    n: "03",
    title: "Wait for the receipt",
    body: "Credits follow the shade scale after staff accept the collar. A kerb drop, a damp edge, or a self-count is not a credit.",
  },
] as const;

export const COLLAR_RULES = [
  "Dry school collars, house collars, PE collars and spare collars only.",
  "Dry the collar and clear the edge before the window.",
  "No damp monsoon collar, wet fold, or soft edge.",
  "Do not mix with cuffs, hems, or plackets.",
  "Credits wait on the shade scale — never a self-weigh or a kerb drop.",
] as const;
