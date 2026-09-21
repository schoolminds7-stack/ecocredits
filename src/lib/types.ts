export type Role = "USER" | "COLLECTION_AGENT" | "ADMIN";
export type WasteStatus = "CREATED" | "SCHEDULED" | "CREDITED" | "REJECTED";
export type QualityGrade = "GRADE_A" | "GRADE_B" | "GRADE_C";
export type CollectionMethod = "COLLECTION_CENTER" | "HOME_PICKUP";
export type LedgerType =
  | "WASTE_REWARD"
  | "REDEMPTION_HOLD"
  | "REDEMPTION_COMPLETED";
export type RedemptionStatus = "PENDING" | "COMPLETED" | "EXPIRED";

export type User = {
  id: string;
  fullName: string;
  phone: string;
  password: string;
  role: Role;
  status: "ACTIVE";
};

export type Wallet = {
  userId: string;
  availableBalance: number;
  lockedBalance: number;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  unit: "KG";
  creditPerKg: number;
  minimumWeight: number;
  active: boolean;
};

export type Submission = {
  id: string;
  userId: string;
  categoryId: string;
  estimatedWeight: number;
  collectionMethod: CollectionMethod;
  pickupAddress: string | null;
  status: WasteStatus;
  qualityGrade: QualityGrade | null;
  verifiedWeight: number | null;
  finalCredits: number | null;
  createdAt: string;
  creditedAt: string | null;
};

export type Product = {
  id: string;
  name: string;
  blurb: string;
  creditPrice: number;
  stockQuantity: number;
  active: boolean;
};

export type LedgerEntry = {
  id: string;
  userId: string;
  transactionType: LedgerType;
  amount: number;
  referenceType: string;
  referenceId: string;
  balanceAfter: number;
  createdAt: string;
};

export type Redemption = {
  id: string;
  userId: string;
  productId: string;
  credits: number;
  status: RedemptionStatus;
  token: string;
  otp: string;
  expiresAt: string;
  createdAt: string;
  completedAt: string | null;
};
