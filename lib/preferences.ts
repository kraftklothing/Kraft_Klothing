import { LikedDress, UserPreferences } from "./types";

export const PREFERENCES_STORAGE_KEY = "kraft-klothing-preferences";

function migrateLikedItem(item: Record<string, unknown>): LikedDress {
  const categoryIds = Array.isArray(item.categoryIds)
    ? (item.categoryIds as string[])
    : item.categoryId
      ? [item.categoryId as string]
      : [];

  return {
    dressId: item.dressId as string,
    categoryIds: categoryIds.filter((id) => id !== "legacy"),
    fitLabel: item.fitLabel as string | undefined,
  };
}

function migratePreferences(raw: Record<string, unknown>): UserPreferences {
  const dislikedIds = Array.isArray(raw.dislikedIds) ? raw.dislikedIds : [];

  if (Array.isArray(raw.liked)) {
    return {
      liked: (raw.liked as Record<string, unknown>[]).map(migrateLikedItem),
      dislikedIds,
    };
  }

  const legacyLikedIds = Array.isArray(raw.likedIds) ? raw.likedIds : [];
  return {
    liked: legacyLikedIds.map((dressId: string) => ({
      dressId,
      categoryIds: [],
    })),
    dislikedIds,
  };
}

function readPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return { liked: [], dislikedIds: [] };
  }
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return { liked: [], dislikedIds: [] };
    return migratePreferences(JSON.parse(raw));
  } catch {
    return { liked: [], dislikedIds: [] };
  }
}

function writePreferences(prefs: UserPreferences): void {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  notifyPreferencesUpdated();
}

export function getLiked(): LikedDress[] {
  return readPreferences().liked;
}

export function getLikedIds(): string[] {
  return getLiked().map((l) => l.dressId);
}

export function getLikedEntry(dressId: string): LikedDress | undefined {
  return getLiked().find((l) => l.dressId === dressId);
}

export function getDislikedIds(): string[] {
  return readPreferences().dislikedIds;
}

export function likeDress(dressId: string, categoryIds: string[]): void {
  const prefs = readPreferences();
  prefs.dislikedIds = prefs.dislikedIds.filter((d) => d !== dressId);

  const existingIndex = prefs.liked.findIndex((l) => l.dressId === dressId);
  if (existingIndex >= 0) {
    const existing = prefs.liked[existingIndex];
    const merged = [...new Set([...existing.categoryIds, ...categoryIds])];
    prefs.liked[existingIndex] = { ...existing, categoryIds: merged };
  } else {
    prefs.liked.push({ dressId, categoryIds });
  }

  writePreferences(prefs);
}

export function updateLikedDress(
  dressId: string,
  updates: Partial<Pick<LikedDress, "categoryIds" | "fitLabel">>
): void {
  const prefs = readPreferences();
  const index = prefs.liked.findIndex((l) => l.dressId === dressId);
  if (index === -1) return;

  prefs.liked[index] = { ...prefs.liked[index], ...updates };
  writePreferences(prefs);
}

export function dislikeDress(id: string): void {
  const prefs = readPreferences();
  prefs.liked = prefs.liked.filter((l) => l.dressId !== id);
  if (!prefs.dislikedIds.includes(id)) {
    prefs.dislikedIds.push(id);
  }
  writePreferences(prefs);
}

export function removeFromLiked(id: string): void {
  const prefs = readPreferences();
  prefs.liked = prefs.liked.filter((l) => l.dressId !== id);
  writePreferences(prefs);
}

export function removeFromDisliked(id: string): void {
  const prefs = readPreferences();
  prefs.dislikedIds = prefs.dislikedIds.filter((d) => d !== id);
  writePreferences(prefs);
}

export function notifyPreferencesUpdated(): void {
  window.dispatchEvent(new Event("kraft-preferences-updated"));
}
