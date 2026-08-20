import { Redis } from "@upstash/redis";
import { normalizeListingCategory } from "@/lib/categories";
import { Dress } from "@/lib/types";

export const SHARED_DRESSES_KEY = "kraft-klothing-dresses";

function createRedis(): Redis | null {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    "";
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    "";

  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isSharedStoreConfigured(): boolean {
  return createRedis() !== null;
}

function normalizeDresses(value: unknown): Dress[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Dress => !!item && typeof item === "object")
    .map((dress) => ({
      ...dress,
      name: typeof dress.name === "string" ? dress.name.trim() : "",
      size: dress.size ?? "Unknown",
      category: normalizeListingCategory(dress.category),
      images: Array.isArray(dress.images) ? dress.images : [],
      deposit: Number(dress.deposit) || 0,
      cleaningCharge: Number(dress.cleaningCharge) || 0,
    }));
}

export async function readSharedDresses(): Promise<Dress[] | null> {
  const redis = createRedis();
  if (!redis) return null;
  const value = await redis.get<Dress[] | string>(SHARED_DRESSES_KEY);
  if (value == null) return [];
  if (typeof value === "string") {
    try {
      return normalizeDresses(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return normalizeDresses(value);
}

export async function writeSharedDresses(dresses: Dress[]): Promise<boolean> {
  const redis = createRedis();
  if (!redis) return false;
  await redis.set(SHARED_DRESSES_KEY, dresses);
  return true;
}
