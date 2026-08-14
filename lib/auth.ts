import { AuthSession, StoredUser, UserRole } from "./types";

export const AUTH_STORAGE_KEY = "kraft-klothing-auth";
export const USERS_STORAGE_KEY = "kraft-klothing-users";

const MODERATOR_USERNAME = "ked2000";
const MODERATOR_PASSWORD = "swimmingwolvesrock510";

/** Temp shopper account — can browse/rent in demo mode without locking inventory. */
const SANDBOX_USERNAME = "shopperpogger";
const SANDBOX_PASSWORD = "poggershopper";
const SANDBOX_DISPLAY_NAME = "shopperpogger";

export type AccountDirectoryEntry = {
  username: string;
  role: UserRole;
  builtIn: boolean;
};

const BUILT_IN_ACCOUNTS: AccountDirectoryEntry[] = [
  { username: "Ked2000", role: "moderator", builtIn: true },
  { username: SANDBOX_DISPLAY_NAME, role: "sandbox", builtIn: true },
];

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function saveSession(session: AuthSession): AuthSession {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function isSandboxUsername(username: string): boolean {
  return username.trim().toLowerCase() === SANDBOX_USERNAME;
}

/** All known accounts with their access type (for moderator directory). */
export function listAccounts(): AccountDirectoryEntry[] {
  const reserved = new Set(
    BUILT_IN_ACCOUNTS.map((a) => a.username.toLowerCase())
  );
  const registered: AccountDirectoryEntry[] = readUsers()
    .filter((u) => !reserved.has(u.username.toLowerCase()))
    .map((u) => ({
      username: u.username,
      role: "user" as const,
      builtIn: false,
    }));

  return [...BUILT_IN_ACCOUNTS, ...registered].sort((a, b) =>
    a.username.localeCompare(b.username, undefined, { sensitivity: "base" })
  );
}

export function accessLabel(role: UserRole): string {
  switch (role) {
    case "moderator":
      return "Moderator";
    case "sandbox":
      return "Sandbox shopper";
    case "user":
    default:
      return "Member shopper";
  }
}

export function signUp(username: string, password: string): AuthSession | { error: string } {
  const trimmed = username.trim();
  const normalized = trimmed.toLowerCase();

  if (!trimmed || !password) {
    return { error: "Username and password are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (normalized === MODERATOR_USERNAME || normalized === SANDBOX_USERNAME) {
    return { error: "This username is reserved." };
  }

  const users = readUsers();
  if (users.some((u) => u.username.toLowerCase() === normalized)) {
    return { error: "Username already taken." };
  }

  users.push({ username: trimmed, password });
  writeUsers(users);

  return saveSession({ username: trimmed, role: "user" });
}

export function login(
  username: string,
  password: string
): AuthSession | { error: string } {
  const trimmed = username.trim();
  const normalized = trimmed.toLowerCase();

  if (!trimmed || !password) {
    return { error: "Username and password are required." };
  }

  if (
    normalized === MODERATOR_USERNAME &&
    password === MODERATOR_PASSWORD
  ) {
    return saveSession({ username: "Ked2000", role: "moderator" });
  }

  if (
    normalized === SANDBOX_USERNAME &&
    password === SANDBOX_PASSWORD
  ) {
    return saveSession({ username: SANDBOX_DISPLAY_NAME, role: "sandbox" });
  }

  const user = readUsers().find(
    (u) => u.username.toLowerCase() === normalized
  );

  if (!user || user.password !== password) {
    return { error: "Invalid username or password." };
  }

  return saveSession({ username: user.username, role: "user" });
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { username: string; role: string };
    if (session.role === "owner") {
      return { username: session.username, role: "moderator" };
    }
    if (session.role === "guest") return null;
    if (
      session.role === "user" ||
      session.role === "moderator" ||
      session.role === "sandbox"
    ) {
      return session as AuthSession;
    }
    // Recover sandbox sessions if role was missing/stale but username matches.
    if (isSandboxUsername(session.username)) {
      return { username: SANDBOX_DISPLAY_NAME, role: "sandbox" };
    }
    return null;
  } catch {
    return null;
  }
}

export function isModerator(session: AuthSession | null): boolean {
  return session?.role === "moderator";
}

export function isSandbox(session: AuthSession | null): boolean {
  return session?.role === "sandbox" || isSandboxUsername(session?.username ?? "");
}

export function notifyAuthChange(): void {
  window.dispatchEvent(new Event("kraft-auth-updated"));
}
