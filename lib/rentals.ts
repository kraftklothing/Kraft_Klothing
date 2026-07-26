import { AvailabilityAlert, Rental } from "./types";

export const RENTALS_STORAGE_KEY = "kraft-klothing-rentals";
export const AVAILABILITY_ALERTS_KEY = "kraft-klothing-availability-alerts";

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

function writeRentals(rentals: Rental[]): void {
  localStorage.setItem(RENTALS_STORAGE_KEY, JSON.stringify(rentals));
  window.dispatchEvent(new Event("kraft-rentals-updated"));
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
  writeRentals(rentals);
  return newRental;
}

export function cancelRental(rentalId: string): Rental | null {
  const rentals = getAllRentals();
  const index = rentals.findIndex((r) => r.id === rentalId);
  if (index === -1) return null;

  const [removed] = rentals.splice(index, 1);
  writeRentals(rentals);

  const notified = notifyAvailabilityAlerts(removed.dressId, removed.months);
  if (notified.length > 0) {
    window.dispatchEvent(
      new CustomEvent("kraft-availability-notified", { detail: { alerts: notified } })
    );
  }

  return removed;
}

export function getAllAvailabilityAlerts(): AvailabilityAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AVAILABILITY_ALERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAvailabilityAlerts(alerts: AvailabilityAlert[]): void {
  localStorage.setItem(AVAILABILITY_ALERTS_KEY, JSON.stringify(alerts));
  window.dispatchEvent(new Event("kraft-availability-alerts-updated"));
}

export function getAvailabilityAlert(
  dressId: string,
  month: string,
  username: string
): AvailabilityAlert | undefined {
  return getAllAvailabilityAlerts().find(
    (a) =>
      a.dressId === dressId &&
      a.month === month &&
      a.username.toLowerCase() === username.toLowerCase()
  );
}

export function requestAvailabilityTextAlert(input: {
  dressId: string;
  month: string;
  phone: string;
  username: string;
}): AvailabilityAlert | { error: string } {
  const phone = input.phone.replace(/[^\d+]/g, "").trim();
  if (phone.replace(/\D/g, "").length < 10) {
    return { error: "Enter a valid phone number for text alerts." };
  }
  if (!getBookedMonthsForDress(input.dressId).includes(input.month)) {
    return { error: "That month is already available to rent." };
  }

  const alerts = getAllAvailabilityAlerts();
  const existingIndex = alerts.findIndex(
    (a) =>
      a.dressId === input.dressId &&
      a.month === input.month &&
      a.username.toLowerCase() === input.username.toLowerCase()
  );

  const alert: AvailabilityAlert = {
    id:
      existingIndex >= 0
        ? alerts[existingIndex].id
        : crypto.randomUUID(),
    dressId: input.dressId,
    month: input.month,
    phone,
    username: input.username,
    createdAt:
      existingIndex >= 0
        ? alerts[existingIndex].createdAt
        : new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    alerts[existingIndex] = alert;
  } else {
    alerts.push(alert);
  }

  writeAvailabilityAlerts(alerts);
  return alert;
}

export function removeAvailabilityAlert(
  dressId: string,
  month: string,
  username: string
): void {
  const next = getAllAvailabilityAlerts().filter(
    (a) =>
      !(
        a.dressId === dressId &&
        a.month === month &&
        a.username.toLowerCase() === username.toLowerCase()
      )
  );
  writeAvailabilityAlerts(next);
}

/** When months free up, remove matching alerts and return who was notified. */
export function notifyAvailabilityAlerts(
  dressId: string,
  months: string[]
): AvailabilityAlert[] {
  const monthSet = new Set(months);
  const alerts = getAllAvailabilityAlerts();
  const matched = alerts.filter(
    (a) => a.dressId === dressId && monthSet.has(a.month)
  );
  if (matched.length === 0) return [];

  const matchedIds = new Set(matched.map((a) => a.id));
  writeAvailabilityAlerts(alerts.filter((a) => !matchedIds.has(a.id)));
  return matched;
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
