import { NextResponse } from "next/server";
import {
  isListingCategory,
  normalizeListingCategory,
} from "@/lib/categories";
import {
  isSharedStoreConfigured,
  readSharedDresses,
  writeSharedDresses,
} from "@/lib/dresses-server";
import { Dress } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  if (!isSharedStoreConfigured()) {
    return NextResponse.json(
      {
        error: "Shared inventory is not connected yet.",
        configured: false,
        dresses: [],
      },
      { status: 503 }
    );
  }

  const dresses = (await readSharedDresses()) ?? [];
  return NextResponse.json({ configured: true, dresses });
}

export async function POST(request: Request) {
  if (!isSharedStoreConfigured()) {
    return NextResponse.json(
      { error: "Shared inventory is not connected yet.", configured: false },
      { status: 503 }
    );
  }

  const body = await request.json();
  const dresses = (await readSharedDresses()) ?? [];

  // Bulk import (migrate local listings once)
  if (Array.isArray(body?.dresses)) {
    const incoming = body.dresses as Dress[];
    const byId = new Map(dresses.map((d) => [d.id, d]));
    for (const dress of incoming) {
      if (!dress?.id) continue;
      byId.set(dress.id, {
        ...dress,
        name: typeof dress.name === "string" ? dress.name.trim() : "",
        size: dress.size ?? "Unknown",
        category: normalizeListingCategory(dress.category),
        images: Array.isArray(dress.images) ? dress.images : [],
      });
    }
    const merged = Array.from(byId.values()).sort((a, b) =>
      b.listedAt.localeCompare(a.listedAt)
    );
    await writeSharedDresses(merged);
    return NextResponse.json({ configured: true, dresses: merged });
  }

  const dress = body?.dress as Omit<Dress, "id" | "listedAt"> | undefined;
  if (
    !dress?.brand ||
    !dress?.name ||
    !dress?.color ||
    !dress?.size ||
    !dress?.listedBy
  ) {
    return NextResponse.json({ error: "Invalid clothing payload." }, { status: 400 });
  }
  if (!Array.isArray(dress.images) || dress.images.length === 0) {
    return NextResponse.json({ error: "At least one image is required." }, { status: 400 });
  }
  if (!isListingCategory(dress.category)) {
    return NextResponse.json(
      { error: "A valid listing category is required." },
      { status: 400 }
    );
  }

  const created: Dress = {
    images: dress.images,
    color: String(dress.color).trim(),
    brand: String(dress.brand).trim(),
    name: String(dress.name).trim(),
    size: String(dress.size).trim() || "Unknown",
    category: dress.category,
    pricePerMonth: Number(dress.pricePerMonth) || 0,
    listedBy: String(dress.listedBy).trim(),
    id: crypto.randomUUID(),
    listedAt: new Date().toISOString(),
  };

  const next = [created, ...dresses];
  await writeSharedDresses(next);
  return NextResponse.json({ configured: true, dress: created, dresses: next });
}
