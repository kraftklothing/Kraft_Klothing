import { normalizeListingCategory } from "./categories";
import { Dress } from "./types";

/** Local cache key — used as offline fallback and one-time migrate source. */
export const DRESSES_STORAGE_KEY = "kraft-klothing-dresses";

let cache: Dress[] = [];
let sharedConfigured: boolean | null = null;

function normalizeDress(dress: Dress): Dress {
  return {
    ...dress,
    name: typeof dress.name === "string" ? dress.name.trim() : "",
    size: dress.size ?? "Unknown",
    category: normalizeListingCategory(dress.category),
  };
}

function readLocalDresses(): Dress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRESSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((d: Dress) => normalizeDress(d)) : [];
  } catch {
    return [];
  }
}

function writeLocalDresses(dresses: Dress[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRESSES_STORAGE_KEY, JSON.stringify(dresses));
}

function setCache(dresses: Dress[]): Dress[] {
  cache = dresses.map((d) => normalizeDress(d));
  writeLocalDresses(cache);
  return cache;
}

export function getAllDresses(): Dress[] {
  if (typeof window === "undefined") return [];
  if (cache.length === 0) {
    cache = readLocalDresses();
  }
  return cache;
}

export function getDressById(id: string): Dress | undefined {
  return getAllDresses().find((dress) => dress.id === id);
}

export function isSharedInventoryConfigured(): boolean | null {
  return sharedConfigured;
}

/** Load shared inventory for every device/account. Migrates local listings once. */
export async function loadDresses(): Promise<Dress[]> {
  if (typeof window === "undefined") return [];

  try {
    const response = await fetch("/api/dresses", { cache: "no-store" });
    if (response.status === 503) {
      sharedConfigured = false;
      cache = readLocalDresses();
      notifyDressesUpdated();
      return cache;
    }

    if (!response.ok) {
      throw new Error("Failed to load shared clothing");
    }

    const data = (await response.json()) as {
      configured?: boolean;
      dresses?: Dress[];
    };
    sharedConfigured = data.configured !== false;
    let dresses = Array.isArray(data.dresses) ? data.dresses : [];

    // One-time migrate: if shared store is empty but this browser has listings, upload them.
    const local = readLocalDresses();
    if (dresses.length === 0 && local.length > 0) {
      const migrateResponse = await fetch("/api/dresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dresses: local }),
      });
      if (migrateResponse.ok) {
        const migrated = (await migrateResponse.json()) as { dresses?: Dress[] };
        dresses = Array.isArray(migrated.dresses) ? migrated.dresses : local;
      }
    }

    setCache(dresses);
    notifyDressesUpdated();
    return cache;
  } catch {
    sharedConfigured = sharedConfigured ?? false;
    cache = readLocalDresses();
    notifyDressesUpdated();
    return cache;
  }
}

export async function addDress(
  dress: Omit<Dress, "id" | "listedAt">
): Promise<Dress> {
  if (sharedConfigured !== false) {
    try {
      const response = await fetch("/api/dresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dress }),
      });

      if (response.status === 503) {
        sharedConfigured = false;
      } else if (response.ok) {
        const data = (await response.json()) as {
          dress: Dress;
          dresses?: Dress[];
        };
        sharedConfigured = true;
        if (Array.isArray(data.dresses)) setCache(data.dresses);
        else setCache([data.dress, ...getAllDresses()]);
        notifyDressesUpdated();
        return data.dress;
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Could not save listing to shared inventory.");
      }
    } catch (error) {
      if (sharedConfigured) throw error;
    }
  }

  const newDress: Dress = {
    ...dress,
    id: crypto.randomUUID(),
    listedAt: new Date().toISOString(),
  };
  const dresses = [newDress, ...getAllDresses()];
  setCache(dresses);
  notifyDressesUpdated();
  return newDress;
}

export async function updateDress(
  id: string,
  updates: Partial<Omit<Dress, "id" | "listedAt" | "listedBy">>
): Promise<Dress | null> {
  if (sharedConfigured !== false) {
    try {
      const response = await fetch(`/api/dresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (response.status === 503) {
        sharedConfigured = false;
      } else if (response.ok) {
        const data = (await response.json()) as {
          dress: Dress;
          dresses?: Dress[];
        };
        sharedConfigured = true;
        if (Array.isArray(data.dresses)) setCache(data.dresses);
        else {
          const dresses = getAllDresses();
          const index = dresses.findIndex((d) => d.id === id);
          if (index >= 0) dresses[index] = data.dress;
          setCache(dresses);
        }
        notifyDressesUpdated();
        return data.dress;
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error("Could not update shared listing.");
      }
    } catch (error) {
      if (sharedConfigured) throw error;
    }
  }

  const dresses = getAllDresses();
  const index = dresses.findIndex((d) => d.id === id);
  if (index === -1) return null;
  dresses[index] = { ...dresses[index], ...updates };
  setCache(dresses);
  notifyDressesUpdated();
  return dresses[index];
}

export async function deleteDress(id: string): Promise<boolean> {
  if (sharedConfigured !== false) {
    try {
      const response = await fetch(`/api/dresses/${id}`, { method: "DELETE" });
      if (response.status === 503) {
        sharedConfigured = false;
      } else if (response.ok) {
        const data = (await response.json()) as { dresses?: Dress[] };
        sharedConfigured = true;
        setCache(Array.isArray(data.dresses) ? data.dresses : getAllDresses().filter((d) => d.id !== id));
        notifyDressesUpdated();
        return true;
      } else if (response.status === 404) {
        return false;
      } else {
        throw new Error("Could not delete shared listing.");
      }
    } catch (error) {
      if (sharedConfigured) throw error;
    }
  }

  const dresses = getAllDresses();
  const filtered = dresses.filter((d) => d.id !== id);
  if (filtered.length === dresses.length) return false;
  setCache(filtered);
  notifyDressesUpdated();
  return true;
}

export function getDressesByLister(username: string): Dress[] {
  return getAllDresses().filter(
    (d) => d.listedBy.toLowerCase() === username.toLowerCase()
  );
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function notifyDressesUpdated(): void {
  window.dispatchEvent(new Event("kraft-dresses-updated"));
}
