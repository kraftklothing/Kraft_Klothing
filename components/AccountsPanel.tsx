"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  accessLabel,
  listAccounts,
  type AccountDirectoryEntry,
} from "@/lib/auth";
import { UserRole } from "@/lib/types";

const ROLE_ORDER: UserRole[] = ["moderator", "user", "sandbox"];

function roleHint(role: UserRole): string {
  switch (role) {
    case "moderator":
      return "List/edit clothing, Sales tracking, pack rentals, manage accounts";
    case "sandbox":
      return "Demo access — rentals do not reserve inventory";
    case "user":
    default:
      return "Browse, like, and rent dresses";
  }
}

export default function AccountsPanel() {
  const { isModerator, mounted } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountDirectoryEntry[]>([]);

  useEffect(() => {
    if (mounted && !isModerator) {
      router.replace("/account");
    }
  }, [mounted, isModerator, router]);

  useEffect(() => {
    if (!mounted || !isModerator) return;
    setAccounts(listAccounts());
    const refresh = () => setAccounts(listAccounts());
    window.addEventListener("kraft-auth-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("kraft-auth-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [mounted, isModerator]);

  if (!mounted || !isModerator) {
    return <p className="mt-10 text-sm text-espresso/50">Loading...</p>;
  }

  const byRole = ROLE_ORDER.map((role) => ({
    role,
    accounts: accounts.filter((a) => a.role === role),
  }));

  return (
    <div className="mt-10 space-y-8">
      <div className="rounded-2xl border border-sand bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
          Directory
        </p>
        <h2 className="mt-1 font-serif text-xl text-espresso">All accounts</h2>
        <p className="mt-2 text-sm text-espresso/60">
          {accounts.length} account{accounts.length === 1 ? "" : "s"} across the
          three access types.
        </p>

        <ul className="mt-6 space-y-2">
          {accounts.map((account) => (
            <li
              key={`${account.role}-${account.username}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-sand px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-espresso">
                  {account.username}
                </p>
                <p className="mt-0.5 text-xs text-espresso/50">
                  {roleHint(account.role)}
                  {account.builtIn ? " · Built-in" : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-terracotta/40 bg-terracotta/5 px-3 py-1 text-xs font-medium text-terracotta">
                {accessLabel(account.role)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {byRole.map(({ role, accounts: group }) => (
          <div
            key={role}
            className="rounded-2xl border border-sand bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
              {accessLabel(role)}
            </p>
            <p className="mt-1 text-2xl font-serif text-espresso">
              {group.length}
            </p>
            <ul className="mt-3 space-y-1">
              {group.length === 0 ? (
                <li className="text-xs text-espresso/40">None yet</li>
              ) : (
                group.map((account) => (
                  <li
                    key={account.username}
                    className="truncate text-sm text-espresso/70"
                  >
                    {account.username}
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
