"use client";

import { useEffect, useState } from "react";
import { getPersonalDetails, savePersonalDetails } from "@/lib/account";
import { PersonalDetails } from "@/lib/types";

type PersonalDetailsPanelProps = {
  username: string;
};

export default function PersonalDetailsPanel({
  username,
}: PersonalDetailsPanelProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<PersonalDetails>({
    name: "",
    address: "",
    city: "",
    country: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const refresh = () => setDetails(getPersonalDetails(username));
    refresh();
    window.addEventListener("kraft-account-updated", refresh);
    return () => window.removeEventListener("kraft-account-updated", refresh);
  }, [username]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    savePersonalDetails(username, details);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
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
            Profile info
          </p>
          <h2 className="mt-1 font-serif text-xl text-espresso">
            Personal Details
          </h2>
        </div>
        <span className="text-sm text-espresso/50">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-sm text-espresso/60">
            Optional — add your name and address for pickups and future
            deliveries.
          </p>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
              Name
            </span>
            <input
              type="text"
              value={details.name}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
              Address
            </span>
            <input
              type="text"
              value={details.address}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, address: e.target.value }))
              }
              className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                City
              </span>
              <input
                type="text"
                value={details.city}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, city: e.target.value }))
                }
                className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                Country
              </span>
              <input
                type="text"
                value={details.country}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, country: e.target.value }))
                }
                className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
              />
            </label>
          </div>

          <button
            type="submit"
            className="rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta"
          >
            Save details
          </button>
          {saved && (
            <p className="text-sm text-espresso/60">Personal details saved.</p>
          )}
        </form>
      )}
    </div>
  );
}
