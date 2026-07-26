"use client";

import { useEffect, useState } from "react";
import {
  getPaymentMethod,
  removePaymentMethod,
  savePaymentMethod,
} from "@/lib/account";
import { SavedPaymentMethod } from "@/lib/types";

type PaymentMethodPanelProps = {
  username: string;
};

export default function PaymentMethodPanel({
  username,
}: PaymentMethodPanelProps) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<SavedPaymentMethod | null>(null);
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const refresh = () => setMethod(getPaymentMethod(username));
    refresh();
    window.addEventListener("kraft-account-updated", refresh);
    return () => window.removeEventListener("kraft-account-updated", refresh);
  }, [username]);

  function resetForm() {
    setNameOnCard("");
    setCardNumber("");
    setExpMonth("");
    setExpYear("");
    setCvc("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!cvc.trim()) {
      setError("Enter the CVC to save your card for later.");
      return;
    }

    const result = savePaymentMethod(username, {
      cardNumber,
      expMonth,
      expYear,
      nameOnCard,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    // Discard sensitive fields immediately — never charge in beta.
    resetForm();
    setMethod(result);
    setMessage(
      "Card saved for later. No money will move during beta — Stripe comes later."
    );
  }

  function handleRemove() {
    removePaymentMethod(username);
    setMethod(null);
    setMessage("Payment method removed.");
  }

  return (
    <div className="mt-8 rounded-2xl border border-sand bg-white p-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Payments
          </p>
          <h2 className="mt-1 font-serif text-xl text-espresso">
            Add credit card
          </h2>
        </div>
        <span className="text-sm text-espresso/50">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="rounded-xl bg-sand/60 px-4 py-3 text-sm text-espresso/70">
            Beta mode: you can save a card on file, but you won’t be charged
            anything on this site yet.
          </p>

          {method && (
            <div className="rounded-xl border border-sand px-4 py-3">
              <p className="text-sm font-medium text-espresso">
                {method.brand} ···· {method.last4}
              </p>
              <p className="mt-1 text-xs text-espresso/55">
                Exp {method.expMonth}/{method.expYear}
                {method.nameOnCard ? ` · ${method.nameOnCard}` : ""}
              </p>
              <button
                type="button"
                onClick={handleRemove}
                className="mt-2 text-xs font-medium text-red-600 hover:underline"
              >
                Remove card
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                Name on card
              </span>
              <input
                type="text"
                required
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                Card number
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="•••• •••• •••• ••••"
                className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
              />
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                  MM
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={2}
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                  YY
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={4}
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                  CVC
                </span>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={4}
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
                />
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-espresso/70">{message}</p>}

            <button
              type="submit"
              className="rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta"
            >
              {method ? "Update card" : "Save card"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
