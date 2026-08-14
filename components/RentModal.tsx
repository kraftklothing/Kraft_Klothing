"use client";

import { useEffect, useState } from "react";
import { isSandboxUsername } from "@/lib/auth";
import { formatPrice, getDressById } from "@/lib/dresses";
import {
  createRental,
  formatMonth,
  getAvailabilityAlert,
  getBookedMonthsForDress,
  getUpcomingMonths,
  removeAvailabilityAlert,
  requestAvailabilityTextAlert,
} from "@/lib/rentals";

type RentModalProps = {
  dressId: string;
  username: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function RentModal({
  dressId,
  username,
  open,
  onClose,
  onSuccess,
}: RentModalProps) {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState("");
  const [bookedMonths, setBookedMonths] = useState<string[]>([]);
  const [notifyMonth, setNotifyMonth] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyError, setNotifyError] = useState("");
  const [alertMonths, setAlertMonths] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dress = getDressById(dressId);
  const upcomingMonths = getUpcomingMonths(12);

  function refreshBookedAndAlerts() {
    setBookedMonths(getBookedMonthsForDress(dressId));
    setAlertMonths(
      upcomingMonths
        .map((m) => m.value)
        .filter((month) => !!getAvailabilityAlert(dressId, month, username))
    );
  }

  useEffect(() => {
    if (!open) return;
    setSelectedMonths([]);
    setPickupDate("");
    setError("");
    setNotifyMonth(null);
    setPhone("");
    setNotifyMessage("");
    setNotifyError("");
    refreshBookedAndAlerts();
  }, [open, dressId, username]);

  useEffect(() => {
    if (!open) return;
    const refresh = () => refreshBookedAndAlerts();
    window.addEventListener("kraft-rentals-updated", refresh);
    window.addEventListener("kraft-availability-alerts-updated", refresh);
    return () => {
      window.removeEventListener("kraft-rentals-updated", refresh);
      window.removeEventListener("kraft-availability-alerts-updated", refresh);
    };
  }, [open, dressId, username]);

  function toggleMonth(value: string) {
    if (bookedMonths.includes(value)) return;
    setSelectedMonths((prev) =>
      prev.includes(value)
        ? prev.filter((m) => m !== value)
        : [...prev, value]
    );
  }

  function handleNotifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notifyMonth) return;
    setNotifyError("");
    setNotifyMessage("");

    const result = requestAvailabilityTextAlert({
      dressId,
      month: notifyMonth,
      phone,
      username,
    });

    if ("error" in result) {
      setNotifyError(result.error);
      return;
    }

    setNotifyMessage(
      `Got it — we'll text ${result.phone} if ${formatMonth(notifyMonth)} opens up.`
    );
    setNotifyMonth(null);
    setPhone("");
    refreshBookedAndAlerts();
  }

  function handleRemoveAlert(month: string) {
    removeAvailabilityAlert(dressId, month, username);
    setNotifyMessage("Text alert removed.");
    refreshBookedAndAlerts();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (selectedMonths.length === 0) {
      setError("Select at least one month.");
      return;
    }
    if (!pickupDate) {
      setError("Select a pickup date.");
      return;
    }

    setSubmitting(true);
    const rental = createRental({
      dressId,
      username,
      months: selectedMonths,
      pickupDate,
    });

    if (!rental) {
      setError("One or more months were just booked. Please try again.");
      setBookedMonths(getBookedMonthsForDress(dressId));
      setSubmitting(false);
      return;
    }

    onSuccess();
    onClose();
    setSubmitting(false);
  }

  if (!open || !dress) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-sand bg-cream p-6 shadow-xl">
        <h2 className="font-serif text-2xl text-espresso">Rent this clothing</h2>
        <p className="mt-1 text-sm text-espresso/60">
          {dress.brand}
          {dress.name ? ` · ${dress.name}` : ""} · Size {dress.size} ·{" "}
          {formatPrice(dress.pricePerMonth)}/month
        </p>
        {isSandboxUsername(username) && (
          <p className="mt-3 rounded-xl bg-sand/60 px-3 py-2 text-xs text-espresso/70">
            Sandbox mode: this rental is demo-only and will not reserve the
            clothing for other accounts.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-espresso/50">
              Select month(s)
            </p>
            <p className="mt-1 text-xs text-espresso/50">
              Booked months can get a text alert if they open up again.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {upcomingMonths.map((month) => {
                const isBooked = bookedMonths.includes(month.value);
                const isSelected = selectedMonths.includes(month.value);
                const hasAlert = alertMonths.includes(month.value);
                return (
                  <div key={month.value} className="space-y-1">
                    <button
                      type="button"
                      disabled={isBooked}
                      onClick={() => toggleMonth(month.value)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        isBooked
                          ? "cursor-not-allowed border-sand bg-sand/50 text-espresso/30 line-through"
                          : isSelected
                            ? "border-terracotta bg-terracotta/10 font-medium text-espresso"
                            : "border-sand bg-white text-espresso hover:border-terracotta/30"
                      }`}
                    >
                      {month.label}
                    </button>
                    {isBooked && (
                      <button
                        type="button"
                        onClick={() => {
                          setNotifyMonth(month.value);
                          setNotifyError("");
                          setNotifyMessage("");
                          const existing = getAvailabilityAlert(
                            dressId,
                            month.value,
                            username
                          );
                          setPhone(existing?.phone ?? "");
                        }}
                        className="w-full text-left text-[11px] font-medium text-terracotta hover:underline"
                      >
                        {hasAlert
                          ? "Edit text alert"
                          : "Notify me by text if available"}
                      </button>
                    )}
                    {isBooked && hasAlert && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAlert(month.value)}
                        className="w-full text-left text-[11px] text-espresso/45 hover:text-espresso/70"
                      >
                        Remove alert
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {notifyMonth && (
            <div className="rounded-xl border border-terracotta/30 bg-white p-4">
              <p className="text-sm font-medium text-espresso">
                Text me for {formatMonth(notifyMonth)}
              </p>
              <p className="mt-1 text-xs text-espresso/55">
                Enter your mobile number and we’ll text you if this month opens
                up.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile number"
                  className="flex-1 rounded-xl border border-sand bg-cream px-4 py-2.5 text-sm outline-none focus:border-terracotta"
                />
                <button
                  type="button"
                  onClick={handleNotifySubmit}
                  className="rounded-full bg-espresso px-4 py-2.5 text-sm font-medium text-cream hover:bg-terracotta"
                >
                  Save alert
                </button>
              </div>
              {notifyError && (
                <p className="mt-2 text-sm text-red-600">{notifyError}</p>
              )}
            </div>
          )}

          {notifyMessage && (
            <p className="text-sm text-espresso/70">{notifyMessage}</p>
          )}

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
              Pickup date
            </span>
            <input
              type="date"
              required
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
            />
          </label>

          {selectedMonths.length > 0 && (
            <div className="rounded-xl bg-sand/50 px-4 py-3 text-sm text-espresso/70">
              Total:{" "}
              <strong>
                {formatPrice(dress.pricePerMonth * selectedMonths.length)}
              </strong>{" "}
              for {selectedMonths.length}{" "}
              {selectedMonths.length === 1 ? "month" : "months"}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-sand py-2.5 text-sm font-medium text-espresso"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-espresso py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta disabled:opacity-40"
            >
              Confirm rental
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
