export type Dress = {
  id: string;
  images: string[];
  color: string;
  brand: string;
  size: string;
  pricePerMonth: number;
  listedAt: string;
  listedBy: string;
};

export type UserRole = "user" | "moderator";

export type AuthSession = {
  username: string;
  role: UserRole;
};

export type StoredUser = {
  username: string;
  password: string;
};

export type ClosetCategory = {
  id: string;
  name: string;
};

export type FitLabelOption = {
  id: string;
  name: string;
};

export type LikedDress = {
  dressId: string;
  categoryIds: string[];
  fitLabel?: string;
};

export type UserPreferences = {
  liked: LikedDress[];
  dislikedIds: string[];
};

export type PersonalDetails = {
  name: string;
  address: string;
  city: string;
  country: string;
};

/** Saved for future Stripe — never charged during beta. */
export type SavedPaymentMethod = {
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  nameOnCard: string;
  savedAt: string;
};

export type UserAccountData = {
  categories: ClosetCategory[];
  fitLabels: FitLabelOption[];
  personalDetails?: PersonalDetails;
  paymentMethod?: SavedPaymentMethod | null;
};

export type Rental = {
  id: string;
  dressId: string;
  username: string;
  months: string[];
  pickupDate: string;
  createdAt: string;
};

/** Text waitlist for a dress+month that is currently booked. */
export type AvailabilityAlert = {
  id: string;
  dressId: string;
  month: string;
  phone: string;
  username: string;
  createdAt: string;
};
