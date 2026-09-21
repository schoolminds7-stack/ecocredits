import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { uid } from "./utils";
import type {
  Category,
  CollectionMethod,
  LedgerEntry,
  Product,
  QualityGrade,
  Redemption,
  Role,
  Submission,
  User,
  Wallet,
} from "./types";

const CATEGORIES: Category[] = [
  { id: "cat-plastic", name: "Plastic", description: "Bottles, containers, film", unit: "KG", creditPerKg: 10, minimumWeight: 1, active: true },
  { id: "cat-metal", name: "Metal", description: "Cans, scrap, foil", unit: "KG", creditPerKg: 25, minimumWeight: 1, active: true },
  { id: "cat-wood", name: "Wood", description: "Clean timber offcuts", unit: "KG", creditPerKg: 5, minimumWeight: 1, active: true },
  { id: "cat-paper", name: "Paper", description: "Newspapers, office paper", unit: "KG", creditPerKg: 8, minimumWeight: 1, active: true },
  { id: "cat-glass", name: "Glass", description: "Jars and bottles", unit: "KG", creditPerKg: 6, minimumWeight: 1, active: true },
  { id: "cat-cardboard", name: "Cardboard", description: "Corrugated boxes", unit: "KG", creditPerKg: 7, minimumWeight: 1, active: true },
  { id: "cat-ewaste", name: "E-Waste", description: "Phones, cables, small electronics", unit: "KG", creditPerKg: 20, minimumWeight: 1, active: true },
  { id: "cat-textile", name: "Textile", description: "Clean fabric and clothing", unit: "KG", creditPerKg: 9, minimumWeight: 1, active: true },
];

const PRODUCTS: Product[] = [
  { id: "p-rice", name: "Rice 5 kg", blurb: "Staple grain pack for the household", creditPrice: 350, stockQuantity: 50, active: true },
  { id: "p-wheat", name: "Wheat Flour 5 kg", blurb: "Stone-milled atta for daily meals", creditPrice: 280, stockQuantity: 50, active: true },
  { id: "p-cook", name: "Cooking Essentials", blurb: "Oil, salt, and spices kit", creditPrice: 220, stockQuantity: 40, active: true },
  { id: "p-hygiene", name: "Hygiene Kit", blurb: "Soap, detergent, and sanitizer", creditPrice: 180, stockQuantity: 40, active: true },
];

/** Sole bootstrap account — no demo households or agents. */
const BOOTSTRAP_ADMIN: User = {
  id: "u-admin",
  fullName: "EcoCredits Admin",
  phone: "9948499744",
  password: "kannamma*12",
  role: "ADMIN",
  status: "ACTIVE",
};

function ensureBootstrap(users: User[], wallets: Wallet[]): { users: User[]; wallets: Wallet[] } {
  const hasAdmin = users.some((u) => u.phone === BOOTSTRAP_ADMIN.phone);
  if (hasAdmin) return { users, wallets };
  return {
    users: [BOOTSTRAP_ADMIN, ...users],
    wallets: [{ userId: BOOTSTRAP_ADMIN.id, availableBalance: 0, lockedBalance: 0 }, ...wallets],
  };
}

type EcoState = {
  users: User[];
  wallets: Wallet[];
  categories: Category[];
  products: Product[];
  submissions: Submission[];
  ledger: LedgerEntry[];
  redemptions: Redemption[];
  sessionUserId: string | null;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  login: (phone: string, password: string) => void;
  register: (fullName: string, phone: string, password: string) => void;
  logout: () => void;
  currentUser: () => User | null;
  walletOf: (userId?: string | null) => Wallet | null;
  createSubmission: (input: {
    categoryId: string;
    estimatedWeight: number;
    collectionMethod: CollectionMethod;
    pickupAddress?: string | null;
  }) => Submission;
  verifySubmission: (id: string, weight: number, grade: QualityGrade) => Submission;
  rejectSubmission: (id: string, note?: string) => Submission;
  redeem: (productId: string) => Redemption;
  completeRedemption: (id: string, otp: string) => Redemption;
  cancelRedemption: (id: string) => Redemption;
  updateRate: (categoryId: string, creditPerKg: number) => void;
  setCategoryActive: (categoryId: string, active: boolean) => void;
  updateUserRole: (userId: string, role: Role) => void;
  updateProduct: (
    productId: string,
    patch: Partial<Pick<Product, "creditPrice" | "stockQuantity" | "active" | "name" | "blurb">>,
  ) => void;
  changePassword: (currentPassword: string, newPassword: string) => void;
  updateProfile: (fullName: string) => void;
};

function qualityMul(g: QualityGrade) {
  if (g === "GRADE_A") return 1.2;
  if (g === "GRADE_B") return 1;
  if (g === "GRADE_C") return 0.7;
  return 0;
}

const memoryStorage: Record<string, string> = {};

export const useEcoStore = create<EcoState>()(
  persist(
    (set, get) => ({
      users: [BOOTSTRAP_ADMIN],
      wallets: [{ userId: BOOTSTRAP_ADMIN.id, availableBalance: 0, lockedBalance: 0 }],
      categories: CATEGORIES,
      products: PRODUCTS,
      submissions: [],
      ledger: [],
      redemptions: [],
      sessionUserId: null,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      currentUser: () => {
        const id = get().sessionUserId;
        return get().users.find((u) => u.id === id) ?? null;
      },
      walletOf: (userId) => {
        const id = userId ?? get().sessionUserId;
        if (!id) return null;
        return get().wallets.find((w) => w.userId === id) ?? null;
      },
      login: (phone, password) => {
        const user = get().users.find((u) => u.phone === phone.trim());
        if (!user || user.password !== password) {
          throw new Error("Invalid mobile number or password.");
        }
        if (user.status !== "ACTIVE") {
          throw new Error("This account is suspended. Contact support.");
        }
        set({ sessionUserId: user.id });
      },
      register: (fullName, phone, password) => {
        const p = phone.trim().replace(/\s+/g, "");
        if (!fullName.trim() || !p || password.length < 6) {
          throw new Error("Name, mobile, and a password of 6+ characters are required.");
        }
        if (!/^\d{10}$/.test(p)) {
          throw new Error("Enter a valid 10-digit mobile number.");
        }
        if (get().users.some((u) => u.phone === p)) {
          throw new Error("An account already exists for this mobile number.");
        }
        const user: User = {
          id: uid("u"),
          fullName: fullName.trim(),
          phone: p,
          password,
          role: "USER",
          status: "ACTIVE",
        };
        set((s) => ({
          users: [user, ...s.users],
          wallets: [...s.wallets, { userId: user.id, availableBalance: 0, lockedBalance: 0 }],
          sessionUserId: user.id,
        }));
      },
      logout: () => set({ sessionUserId: null }),
      createSubmission: (input) => {
        const userId = get().sessionUserId;
        if (!userId) throw new Error("Sign in first.");
        const cat = get().categories.find((c) => c.id === input.categoryId && c.active);
        if (!cat) throw new Error("Waste category not found or inactive.");
        if (input.estimatedWeight < cat.minimumWeight) {
          throw new Error(`Minimum weight for ${cat.name} is ${cat.minimumWeight} kg.`);
        }
        if (input.collectionMethod === "HOME_PICKUP" && !input.pickupAddress?.trim()) {
          throw new Error("Pickup address is required for home collection.");
        }
        const s: Submission = {
          id: uid("s"),
          userId,
          categoryId: cat.id,
          estimatedWeight: input.estimatedWeight,
          collectionMethod: input.collectionMethod,
          pickupAddress:
            input.collectionMethod === "HOME_PICKUP" ? input.pickupAddress!.trim() : null,
          status: "CREATED",
          qualityGrade: null,
          verifiedWeight: null,
          finalCredits: null,
          createdAt: new Date().toISOString(),
          creditedAt: null,
        };
        set((st) => ({ submissions: [s, ...st.submissions] }));
        return s;
      },
      verifySubmission: (id, weight, grade) => {
        const st = get();
        const actor = st.currentUser();
        if (!actor || (actor.role !== "ADMIN" && actor.role !== "COLLECTION_AGENT")) {
          throw new Error("Only collection staff can verify.");
        }
        const s = st.submissions.find((x) => x.id === id);
        if (!s) throw new Error("Submission not found.");
        if (s.status === "CREDITED") throw new Error("Already credited.");
        if (s.status === "REJECTED") throw new Error("Submission was rejected.");
        const cat = st.categories.find((c) => c.id === s.categoryId);
        if (!cat) throw new Error("No credit rate for this material.");
        if (weight < cat.minimumWeight) throw new Error("Weight is below minimum.");
        const credits = Number((weight * cat.creditPerKg * qualityMul(grade)).toFixed(2));
        const now = new Date().toISOString();
        if (credits <= 0) {
          const rejected: Submission = {
            ...s,
            status: "REJECTED",
            qualityGrade: grade,
            verifiedWeight: weight,
          };
          set({ submissions: st.submissions.map((x) => (x.id === id ? rejected : x)) });
          return rejected;
        }
        const wallet = st.wallets.find((w) => w.userId === s.userId);
        if (!wallet) throw new Error("Wallet not found.");
        const nextBal = Number((wallet.availableBalance + credits).toFixed(2));
        const credited: Submission = {
          ...s,
          status: "CREDITED",
          qualityGrade: grade,
          verifiedWeight: weight,
          finalCredits: credits,
          creditedAt: now,
        };
        const entry: LedgerEntry = {
          id: uid("l"),
          userId: s.userId,
          transactionType: "WASTE_REWARD",
          amount: credits,
          referenceType: "WASTE_SUBMISSION",
          referenceId: s.id,
          balanceAfter: nextBal,
          createdAt: now,
        };
        set({
          submissions: st.submissions.map((x) => (x.id === id ? credited : x)),
          wallets: st.wallets.map((w) =>
            w.userId === s.userId ? { ...w, availableBalance: nextBal } : w,
          ),
          ledger: [entry, ...st.ledger],
        });
        return credited;
      },
      rejectSubmission: (id) => {
        const st = get();
        const actor = st.currentUser();
        if (!actor || (actor.role !== "ADMIN" && actor.role !== "COLLECTION_AGENT")) {
          throw new Error("Only collection staff can reject.");
        }
        const s = st.submissions.find((x) => x.id === id);
        if (!s) throw new Error("Submission not found.");
        if (s.status === "CREDITED") throw new Error("Already credited — cannot reject.");
        if (s.status === "REJECTED") throw new Error("Already rejected.");
        const rejected: Submission = { ...s, status: "REJECTED" };
        set({ submissions: st.submissions.map((x) => (x.id === id ? rejected : x)) });
        return rejected;
      },
      redeem: (productId) => {
        const st = get();
        const userId = st.sessionUserId;
        if (!userId) throw new Error("Sign in first.");
        const product = st.products.find((p) => p.id === productId && p.active);
        if (!product || product.stockQuantity <= 0) throw new Error("Product unavailable.");
        const wallet = st.wallets.find((w) => w.userId === userId);
        if (!wallet) throw new Error("Wallet not found.");
        const cost = product.creditPrice;
        if (wallet.availableBalance < cost) throw new Error("Insufficient EcoCredits.");
        const nextAvail = Number((wallet.availableBalance - cost).toFixed(2));
        const nextLocked = Number((wallet.lockedBalance + cost).toFixed(2));
        const otp = String(100000 + Math.floor(Math.random() * 900000));
        const token = crypto.randomUUID();
        const r: Redemption = {
          id: uid("r"),
          userId,
          productId,
          credits: cost,
          status: "PENDING",
          token,
          otp,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        const entry: LedgerEntry = {
          id: uid("l"),
          userId,
          transactionType: "REDEMPTION_HOLD",
          amount: -cost,
          referenceType: "REDEMPTION",
          referenceId: r.id,
          balanceAfter: nextAvail,
          createdAt: r.createdAt,
        };
        set({
          products: st.products.map((p) =>
            p.id === productId ? { ...p, stockQuantity: p.stockQuantity - 1 } : p,
          ),
          wallets: st.wallets.map((w) =>
            w.userId === userId
              ? { ...w, availableBalance: nextAvail, lockedBalance: nextLocked }
              : w,
          ),
          redemptions: [r, ...st.redemptions],
          ledger: [entry, ...st.ledger],
        });
        return r;
      },
      completeRedemption: (id, otp) => {
        const st = get();
        const userId = st.sessionUserId;
        if (!userId) throw new Error("Sign in first.");
        const r = st.redemptions.find((x) => x.id === id && x.userId === userId);
        if (!r || r.status !== "PENDING") throw new Error("Redemption not pending.");
        if (new Date(r.expiresAt) < new Date()) throw new Error("Redemption expired.");
        if (r.otp !== otp.trim()) throw new Error("Invalid OTP.");
        const wallet = st.wallets.find((w) => w.userId === userId);
        if (!wallet) throw new Error("Wallet not found.");
        const nextLocked = Math.max(0, Number((wallet.lockedBalance - r.credits).toFixed(2)));
        const done: Redemption = {
          ...r,
          status: "COMPLETED",
          completedAt: new Date().toISOString(),
        };
        const entry: LedgerEntry = {
          id: uid("l"),
          userId,
          transactionType: "REDEMPTION_COMPLETED",
          amount: 0,
          referenceType: "REDEMPTION",
          referenceId: r.id,
          balanceAfter: wallet.availableBalance,
          createdAt: done.completedAt!,
        };
        set({
          redemptions: st.redemptions.map((x) => (x.id === id ? done : x)),
          wallets: st.wallets.map((w) =>
            w.userId === userId ? { ...w, lockedBalance: nextLocked } : w,
          ),
          ledger: [entry, ...st.ledger],
        });
        return done;
      },
      cancelRedemption: (id) => {
        const st = get();
        const userId = st.sessionUserId;
        if (!userId) throw new Error("Sign in first.");
        const r = st.redemptions.find((x) => x.id === id && x.userId === userId);
        if (!r || r.status !== "PENDING") throw new Error("Redemption not pending.");
        const wallet = st.wallets.find((w) => w.userId === userId);
        if (!wallet) throw new Error("Wallet not found.");
        const nextAvail = Number((wallet.availableBalance + r.credits).toFixed(2));
        const nextLocked = Math.max(0, Number((wallet.lockedBalance - r.credits).toFixed(2)));
        const cancelled: Redemption = { ...r, status: "EXPIRED" };
        const entry: LedgerEntry = {
          id: uid("l"),
          userId,
          transactionType: "REDEMPTION_HOLD",
          amount: r.credits,
          referenceType: "REDEMPTION",
          referenceId: r.id,
          balanceAfter: nextAvail,
          createdAt: new Date().toISOString(),
        };
        set({
          redemptions: st.redemptions.map((x) => (x.id === id ? cancelled : x)),
          wallets: st.wallets.map((w) =>
            w.userId === userId
              ? { ...w, availableBalance: nextAvail, lockedBalance: nextLocked }
              : w,
          ),
          products: st.products.map((p) =>
            p.id === r.productId ? { ...p, stockQuantity: p.stockQuantity + 1 } : p,
          ),
          ledger: [entry, ...st.ledger],
        });
        return cancelled;
      },
      updateRate: (categoryId, creditPerKg) => {
        const actor = get().currentUser();
        if (!actor || actor.role !== "ADMIN") throw new Error("Admin only.");
        if (creditPerKg < 0) throw new Error("Rate must be zero or more.");
        set((st) => ({
          categories: st.categories.map((c) =>
            c.id === categoryId ? { ...c, creditPerKg } : c,
          ),
        }));
      },
      setCategoryActive: (categoryId, active) => {
        const actor = get().currentUser();
        if (!actor || actor.role !== "ADMIN") throw new Error("Admin only.");
        set((st) => ({
          categories: st.categories.map((c) =>
            c.id === categoryId ? { ...c, active } : c,
          ),
        }));
      },
      updateUserRole: (userId, role) => {
        const st = get();
        const actor = st.currentUser();
        if (!actor || actor.role !== "ADMIN") {
          throw new Error("Only an administrator can change roles.");
        }
        const target = st.users.find((u) => u.id === userId);
        if (!target) throw new Error("User not found.");
        if (target.id === actor.id && role !== "ADMIN") {
          throw new Error("You cannot remove your own admin role.");
        }
        const adminCount = st.users.filter((u) => u.role === "ADMIN").length;
        if (target.role === "ADMIN" && role !== "ADMIN" && adminCount <= 1) {
          throw new Error("Cannot demote the last administrator.");
        }
        set({
          users: st.users.map((u) => (u.id === userId ? { ...u, role } : u)),
        });
      },
      updateProduct: (productId, patch) => {
        const actor = get().currentUser();
        if (!actor || actor.role !== "ADMIN") throw new Error("Admin only.");
        if (patch.creditPrice != null && patch.creditPrice < 0) {
          throw new Error("Price must be zero or more.");
        }
        if (patch.stockQuantity != null && patch.stockQuantity < 0) {
          throw new Error("Stock cannot be negative.");
        }
        set((st) => ({
          products: st.products.map((p) =>
            p.id === productId ? { ...p, ...patch } : p,
          ),
        }));
      },
      changePassword: (currentPassword, newPassword) => {
        const st = get();
        const user = st.currentUser();
        if (!user) throw new Error("Sign in first.");
        if (user.password !== currentPassword) {
          throw new Error("Current password is incorrect.");
        }
        if (newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters.");
        }
        set({
          users: st.users.map((u) =>
            u.id === user.id ? { ...u, password: newPassword } : u,
          ),
        });
      },
      updateProfile: (fullName) => {
        const st = get();
        const user = st.currentUser();
        if (!user) throw new Error("Sign in first.");
        const name = fullName.trim();
        if (!name) throw new Error("Name is required.");
        set({
          users: st.users.map((u) =>
            u.id === user.id ? { ...u, fullName: name } : u,
          ),
        });
      },
    }),
    {
      name: "ecocredits-v2",
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: (k: string) => memoryStorage[k] ?? null,
              setItem: (k: string, v: string) => {
                memoryStorage[k] = v;
              },
              removeItem: (k: string) => {
                delete memoryStorage[k];
              },
            }
          : localStorage,
      ),
      partialize: (s) => ({
        users: s.users,
        wallets: s.wallets,
        categories: s.categories,
        products: s.products,
        submissions: s.submissions,
        ledger: s.ledger,
        redemptions: s.redemptions,
        sessionUserId: s.sessionUserId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const fixed = ensureBootstrap(state.users, state.wallets);
        if (fixed.users !== state.users || fixed.wallets !== state.wallets) {
          useEcoStore.setState({
            users: fixed.users,
            wallets: fixed.wallets,
          });
        }
      },
    },
  ),
);

export function roleLabel(role: Role) {
  if (role === "ADMIN") return "Admin";
  if (role === "COLLECTION_AGENT") return "Collection agent";
  return "Household";
}
