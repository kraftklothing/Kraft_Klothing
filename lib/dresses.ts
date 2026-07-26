import { Dress } from "./types";

/** Do not rename — listings persist in browser localStorage under this key across code updates. */
export const DRESSES_STORAGE_KEY = "kraft-klothing-dresses";

export function getAllDresses(): Dress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRESSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((d: Dress) => ({ ...d, size: d.size ?? "Unknown" }))
      : [];
  } catch {
    return [];
  }
}

export function getDressById(id: string): Dress | undefined {
  return getAllDresses().find((dress) => dress.id === id);
}

export function addDress(
  dress: Omit<Dress, "id" | "listedAt">
): Dress {
  const newDress: Dress = {
    ...dress,
    id: crypto.randomUUID(),
    listedAt: new Date().toISOString(),
  };
  const dresses = getAllDresses();
  dresses.unshift(newDress);
  localStorage.setItem(DRESSES_STORAGE_KEY, JSON.stringify(dresses));
  notifyDressesUpdated();
  return newDress;
}

export function updateDress(
  id: string,
  updates: Partial<Omit<Dress, "id" | "listedAt" | "listedBy">>
): Dress | null {
  const dresses = getAllDresses();
  const index = dresses.findIndex((d) => d.id === id);
  if (index === -1) return null;

  dresses[index] = { ...dresses[index], ...updates };
  localStorage.setItem(DRESSES_STORAGE_KEY, JSON.stringify(dresses));
  notifyDressesUpdated();
  return dresses[index];
}

export function deleteDress(id: string): boolean {
  const dresses = getAllDresses();
  const filtered = dresses.filter((d) => d.id !== id);
  if (filtered.length === dresses.length) return false;
  localStorage.setItem(DRESSES_STORAGE_KEY, JSON.stringify(filtered));
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
