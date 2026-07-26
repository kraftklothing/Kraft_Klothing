"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import CategoryManager from "@/components/CategoryManager";
import PasswordInput from "@/components/PasswordInput";
import { ensureAccountDefaults } from "@/lib/account";

export default function AccountPanel() {
  const router = useRouter();
  const { session, isModerator, mounted, signIn, register, signOut } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const err = signIn(username, password);
    if (err) {
      setError(err);
      return;
    }
    router.push("/");
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const err = register(username, password);
    if (err) {
      setError(err);
      return;
    }
    ensureAccountDefaults(username.trim());
    router.push("/browse");
  }

  if (!mounted) {
    return <p className="mt-10 text-sm text-espresso/50">Loading...</p>;
  }

  return (
    <>
      <div className="mt-10 rounded-2xl border border-sand bg-white p-8">
        {session ? (
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand font-serif text-2xl text-espresso">
                {session.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-espresso">{session.username}</p>
                <p className="text-sm text-espresso/50">
                  {isModerator ? "Moderator access" : "Member account"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="mt-6 w-full rounded-full border border-sand py-3 text-sm font-medium text-espresso transition-colors hover:border-terracotta hover:text-terracotta"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2 rounded-full bg-sand/50 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  mode === "login"
                    ? "bg-white text-espresso shadow-sm"
                    : "text-espresso/60"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  mode === "signup"
                    ? "bg-white text-espresso shadow-sm"
                    : "text-espresso/60"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form
              onSubmit={mode === "login" ? handleLogin : handleSignup}
              className="mt-6 space-y-4"
            >
              <p className="text-sm text-espresso/60">
                {mode === "login"
                  ? "Log in with your username and password."
                  : "Create an account to browse and rent dresses."}
              </p>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                  Username
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                  Password
                </span>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  required
                />
              </label>

              {mode === "signup" && (
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
                    Confirm password
                  </span>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    required
                  />
                </label>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-full bg-espresso py-3 text-sm font-medium text-cream transition-colors hover:bg-terracotta"
              >
                {mode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>
          </div>
        )}
      </div>

      {session && <CategoryManager username={session.username} />}

      {session && (
        <div className="mt-8 space-y-3">
          <AccountLink
            href="/liked"
            title="Liked Dresses"
            description="Dresses you've hearted"
          />
          <AccountLink
            href="/disliked"
            title="Disliked Dresses"
            description="Passed dresses — change your mind anytime"
          />
          <AccountLink
            href="/browse"
            title="Build your ready to rent closet"
            description="Browse and review all listed dresses"
          />
          <AccountLink
            href="/about"
            title="Policies & Help"
            description="Rental guidelines and support"
          />
        </div>
      )}
    </>
  );
}

function AccountLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-sand bg-white px-5 py-4 transition-colors hover:border-terracotta/30"
    >
      <div>
        <p className="font-medium text-espresso">{title}</p>
        <p className="text-sm text-espresso/50">{description}</p>
      </div>
      <span className="text-terracotta">→</span>
    </Link>
  );
}
