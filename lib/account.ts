import { ClosetCategory, FitLabelOption, UserAccountData } from "./types";

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
  };
}

function getUserData(username: string): UserAccountData {
  const store = readStore();
  if (!store[username]) {
    store[username] = { categories: [], fitLabels: [] };
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
