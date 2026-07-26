import { AuthSession, StoredUser } from "./types";

export const AUTH_STORAGE_KEY = "kraft-klothing-auth";
export const USERS_STORAGE_KEY = "kraft-klothing-users";

const MODERATOR_USERNAME = "ked2000";
const MODERATOR_PASSWORD = "swimmingwolvesrock510";

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

export function signUp(username: string, password: string): AuthSession | { error: string } {
  const trimmed = username.trim();
  const normalized = trimmed.toLowerCase();

  if (!trimmed || !password) {
    return { error: "Username and password are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (normalized === MODERATOR_USERNAME) {
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
    if (session.role === "user" || session.role === "moderator") {
      return session as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function isModerator(session: AuthSession | null): boolean {
  return session?.role === "moderator";
}

export function notifyAuthChange(): void {
  window.dispatchEvent(new Event("kraft-auth-updated"));
}
