import {
  ClosetCategory,
  FitLabelOption,
  PersonalDetails,
  SavedPaymentMethod,
  UserAccountData,
} from "./types";

export const ACCOUNT_DATA_KEY = "kraft-klothing-account-data";

export const RECOMMENDED_CATEGORIES = [
  "Wedding Guest",
  "Batchelorette in Mexico",
];

export const RECOMMENDED_FIT_LABELS: FitLabelOption[] = [
  { id: "fit", name: "Fit" },
  { id: "might-fit", name: "Does not fit but might fit one day" },
  { id: "to-try-on", name: "To try on" },
];

const EMPTY_PERSONAL: PersonalDetails = {
  name: "",
  address: "",
  city: "",
  country: "",
};

function readStore(): Record<string, UserAccountData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNT_DATA_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, UserAccountData>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, UserAccountData>): void {
  localStorage.setItem(ACCOUNT_DATA_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("kraft-account-updated"));
}

function normalizeUserData(data: UserAccountData): UserAccountData {
  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    fitLabels: Array.isArray(data.fitLabels) ? data.fitLabels : [],
    personalDetails: {
      ...EMPTY_PERSONAL,
      ...(data.personalDetails ?? {}),
    },
    paymentMethod: data.paymentMethod ?? null,
  };
}

function getUserData(username: string): UserAccountData {
  const store = readStore();
  if (!store[username]) {
    store[username] = {
      categories: [],
      fitLabels: [],
      personalDetails: { ...EMPTY_PERSONAL },
      paymentMethod: null,
    };
    writeStore(store);
  }
  store[username] = normalizeUserData(store[username]);
  return store[username];
}

export function getCategories(username: string): ClosetCategory[] {
  return getUserData(username).categories;
}

export function getFitLabels(username: string): FitLabelOption[] {
  return getUserData(username).fitLabels;
}

export function getPersonalDetails(username: string): PersonalDetails {
  return getUserData(username).personalDetails ?? { ...EMPTY_PERSONAL };
}

export function savePersonalDetails(
  username: string,
  details: PersonalDetails
): PersonalDetails {
  const store = readStore();
  const data = normalizeUserData(
    store[username] ?? { categories: [], fitLabels: [] }
  );
  data.personalDetails = {
    name: details.name.trim(),
    address: details.address.trim(),
    city: details.city.trim(),
    country: details.country.trim(),
  };
  store[username] = data;
  writeStore(store);
  return data.personalDetails;
}

export function getPaymentMethod(
  username: string
): SavedPaymentMethod | null {
  return getUserData(username).paymentMethod ?? null;
}

export function detectCardBrand(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Card";
}

/** Saves masked card info only. Never charges — beta placeholder for Stripe. */
export function savePaymentMethod(
  username: string,
  input: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    nameOnCard: string;
  }
): SavedPaymentMethod | { error: string } {
  const digits = input.cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) {
    return { error: "Enter a valid card number." };
  }
  const expMonth = input.expMonth.trim();
  const expYear = input.expYear.trim();
  if (!/^\d{2}$/.test(expMonth) || Number(expMonth) < 1 || Number(expMonth) > 12) {
    return { error: "Enter a valid expiration month (MM)." };
  }
  if (!/^\d{2}$/.test(expYear) && !/^\d{4}$/.test(expYear)) {
    return { error: "Enter a valid expiration year." };
  }

  const method: SavedPaymentMethod = {
    brand: detectCardBrand(digits),
    last4: digits.slice(-4),
    expMonth,
    expYear: expYear.length === 4 ? expYear.slice(-2) : expYear,
    nameOnCard: input.nameOnCard.trim(),
    savedAt: new Date().toISOString(),
  };

  const store = readStore();
  const data = normalizeUserData(
    store[username] ?? { categories: [], fitLabels: [] }
  );
  data.paymentMethod = method;
  store[username] = data;
  writeStore(store);
  return method;
}

export function removePaymentMethod(username: string): void {
  const store = readStore();
  const data = normalizeUserData(
    store[username] ?? { categories: [], fitLabels: [] }
  );
  data.paymentMethod = null;
  store[username] = data;
  writeStore(store);
}

export function addCategory(username: string, name: string): ClosetCategory {
  const store = readStore();
  const data = normalizeUserData(store[username] ?? { categories: [], fitLabels: [] });
  const category: ClosetCategory = {
    id: crypto.randomUUID(),
    name: name.trim(),
  };
  data.categories.push(category);
  store[username] = data;
  writeStore(store);
  return category;
}

export function deleteCategory(username: string, categoryId: string): void {
  const store = readStore();
  const data = store[username];
  if (!data) return;
  data.categories = data.categories.filter((c) => c.id !== categoryId);
  store[username] = normalizeUserData(data);
  writeStore(store);
}

export function addFitLabel(username: string, name: string): FitLabelOption {
  const store = readStore();
  const data = normalizeUserData(store[username] ?? { categories: [], fitLabels: [] });
  const label: FitLabelOption = {
    id: crypto.randomUUID(),
    name: name.trim(),
  };
  data.fitLabels.push(label);
  store[username] = data;
  writeStore(store);
  return label;
}

export function deleteFitLabel(username: string, labelId: string): void {
  const store = readStore();
  const data = store[username];
  if (!data) return;
  data.fitLabels = data.fitLabels.filter((l) => l.id !== labelId);
  store[username] = normalizeUserData(data);
  writeStore(store);
}

export function ensureRecommendedCategories(username: string): void {
  const categories = getCategories(username);
  if (categories.length > 0) return;
  RECOMMENDED_CATEGORIES.forEach((name) => addCategory(username, name));
}

export function ensureRecommendedFitLabels(username: string): void {
  const labels = getFitLabels(username);
  if (labels.length > 0) return;
  const store = readStore();
  const data = normalizeUserData(store[username] ?? { categories: [], fitLabels: [] });
  data.fitLabels = [...RECOMMENDED_FIT_LABELS];
  store[username] = data;
  writeStore(store);
}

export function ensureAccountDefaults(username: string): void {
  ensureRecommendedCategories(username);
  ensureRecommendedFitLabels(username);
}

export function getCategoryById(
  username: string,
  categoryId: string
): ClosetCategory | undefined {
  return getCategories(username).find((c) => c.id === categoryId);
}

export function getFitLabelById(
  username: string,
  labelId: string
): FitLabelOption | undefined {
  return getFitLabels(username).find((l) => l.id === labelId);
}
