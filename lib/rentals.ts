import { Rental } from "./types";

export const RENTALS_STORAGE_KEY = "kraft-klothing-rentals";

export function getAllRentals(): Rental[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RENTALS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getBookedMonthsForDress(dressId: string): string[] {
  return getAllRentals()
    .filter((r) => r.dressId === dressId)
    .flatMap((r) => r.months);
}

export function getRentalsForUser(username: string): Rental[] {
  return getAllRentals().filter((r) => r.username === username);
}

export function createRental(
  rental: Omit<Rental, "id" | "createdAt">
): Rental | null {
  const booked = getBookedMonthsForDress(rental.dressId);
  const hasConflict = rental.months.some((m) => booked.includes(m));
  if (hasConflict) return null;

  const newRental: Rental = {
    ...rental,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const rentals = getAllRentals();
  rentals.push(newRental);
  localStorage.setItem(RENTALS_STORAGE_KEY, JSON.stringify(rentals));
  window.dispatchEvent(new Event("kraft-rentals-updated"));
  return newRental;
}

export function getUpcomingMonths(count = 12): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    months.push({ value, label });
  }

  return months;
}

export function formatMonth(value: string): string {
  const [year, month] = value.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
