import { LikedDress, UserPreferences } from "./types";

export const PREFERENCES_STORAGE_KEY = "kraft-klothing-preferences";

const EMPTY_PREFERENCES: UserPreferences = { liked: [], dislikedIds: [] };

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

function isLegacyPreferences(raw: Record<string, unknown>): boolean {
  return Array.isArray(raw.liked) || Array.isArray(raw.likedIds);
}

function readStore(): Record<string, UserPreferences> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    if (isLegacyPreferences(parsed)) {
      return { __legacy__: migratePreferences(parsed) };
    }

    const store: Record<string, UserPreferences> = {};
    for (const [username, value] of Object.entries(parsed)) {
      if (value && typeof value === "object") {
        store[username] = migratePreferences(value as Record<string, unknown>);
      }
    }
    return store;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, UserPreferences>): void {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(store));
  notifyPreferencesUpdated();
}

function consumeLegacyPreferences(
  store: Record<string, UserPreferences>,
  username: string
): UserPreferences {
  const legacy = store.__legacy__;
  if (!legacy) return store[username] ?? EMPTY_PREFERENCES;

  store[username] = legacy;
  delete store.__legacy__;
  writeStore(store);
  return legacy;
}

function readPreferences(username: string): UserPreferences {
  if (!username) return EMPTY_PREFERENCES;

  const store = readStore();
  if (store[username]) return store[username];
  return consumeLegacyPreferences(store, username);
}

function writePreferences(username: string, prefs: UserPreferences): void {
  if (!username) return;

  const store = readStore();
  if (store.__legacy__) {
    consumeLegacyPreferences(store, username);
  }
  store[username] = prefs;
  writeStore(store);
}

export function getLiked(username: string): LikedDress[] {
  return readPreferences(username).liked;
}

export function getLikedIds(username: string): string[] {
  return getLiked(username).map((l) => l.dressId);
}

export function getLikedEntry(
  username: string,
  dressId: string
): LikedDress | undefined {
  return getLiked(username).find((l) => l.dressId === dressId);
}

export function getDislikedIds(username: string): string[] {
  return readPreferences(username).dislikedIds;
}

export function likeDress(
  username: string,
  dressId: string,
  categoryIds: string[]
): void {
  const prefs = readPreferences(username);
  prefs.dislikedIds = prefs.dislikedIds.filter((d) => d !== dressId);

  const existingIndex = prefs.liked.findIndex((l) => l.dressId === dressId);
  if (existingIndex >= 0) {
    const existing = prefs.liked[existingIndex];
    const merged = [...new Set([...existing.categoryIds, ...categoryIds])];
    prefs.liked[existingIndex] = { ...existing, categoryIds: merged };
  } else {
    prefs.liked.push({ dressId, categoryIds });
  }

  writePreferences(username, prefs);
}

export function updateLikedDress(
  username: string,
  dressId: string,
  updates: Partial<Pick<LikedDress, "categoryIds" | "fitLabel">>
): void {
  const prefs = readPreferences(username);
  const index = prefs.liked.findIndex((l) => l.dressId === dressId);
  if (index === -1) return;

  prefs.liked[index] = { ...prefs.liked[index], ...updates };
  writePreferences(username, prefs);
}

export function dislikeDress(username: string, id: string): void {
  const prefs = readPreferences(username);
  prefs.liked = prefs.liked.filter((l) => l.dressId !== id);
  if (!prefs.dislikedIds.includes(id)) {
    prefs.dislikedIds.push(id);
  }
  writePreferences(username, prefs);
}

export function removeFromLiked(username: string, id: string): void {
  const prefs = readPreferences(username);
  prefs.liked = prefs.liked.filter((l) => l.dressId !== id);
  writePreferences(username, prefs);
}

export function removeFromDisliked(username: string, id: string): void {
  const prefs = readPreferences(username);
  prefs.dislikedIds = prefs.dislikedIds.filter((d) => d !== id);
  writePreferences(username, prefs);
}

export function notifyPreferencesUpdated(): void {
  window.dispatchEvent(new Event("kraft-preferences-updated"));
}
