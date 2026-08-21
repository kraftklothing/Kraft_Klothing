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

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSharedStoreConfigured()) {
    return NextResponse.json(
      { error: "Shared inventory is not connected yet.", configured: false },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  const body = await request.json();
  const updates = (body?.updates ?? {}) as Partial<
    Omit<Dress, "id" | "listedAt" | "listedBy">
  >;

  const dresses = (await readSharedDresses()) ?? [];
  const index = dresses.findIndex((d) => d.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Clothing not found." }, { status: 404 });
  }

  if (
    updates.category !== undefined &&
    !isListingCategory(updates.category)
  ) {
    return NextResponse.json(
      { error: "A valid listing category is required." },
      { status: 400 }
    );
  }

  dresses[index] = {
    ...dresses[index],
    ...updates,
    id: dresses[index].id,
    listedAt: dresses[index].listedAt,
    listedBy: dresses[index].listedBy,
    name:
      updates.name !== undefined
        ? String(updates.name).trim()
        : dresses[index].name ?? "",
    category: normalizeListingCategory(
      updates.category ?? dresses[index].category
    ),
    deposit:
      updates.deposit !== undefined
        ? Number(updates.deposit) || 0
        : dresses[index].deposit ?? 0,
    cleaningCharge:
      updates.cleaningCharge !== undefined
        ? Number(updates.cleaningCharge) || 0
        : dresses[index].cleaningCharge ?? 0,
    source:
      updates.source !== undefined
        ? String(updates.source).trim()
        : dresses[index].source ?? "",
    purchasePrice:
      updates.purchasePrice !== undefined
        ? Number(updates.purchasePrice) || 0
        : dresses[index].purchasePrice ?? 0,
  };

  await writeSharedDresses(dresses);
  return NextResponse.json({
    configured: true,
    dress: dresses[index],
    dresses,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isSharedStoreConfigured()) {
    return NextResponse.json(
      { error: "Shared inventory is not connected yet.", configured: false },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  const dresses = (await readSharedDresses()) ?? [];
  const next = dresses.filter((d) => d.id !== id);
  if (next.length === dresses.length) {
    return NextResponse.json({ error: "Clothing not found." }, { status: 404 });
  }

  await writeSharedDresses(next);
  return NextResponse.json({ configured: true, dresses: next });
}
