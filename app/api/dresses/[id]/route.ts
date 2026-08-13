import { NextResponse } from "next/server";
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
    return NextResponse.json({ error: "Dress not found." }, { status: 404 });
  }

  dresses[index] = {
    ...dresses[index],
    ...updates,
    id: dresses[index].id,
    listedAt: dresses[index].listedAt,
    listedBy: dresses[index].listedBy,
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
    return NextResponse.json({ error: "Dress not found." }, { status: 404 });
  }

  await writeSharedDresses(next);
  return NextResponse.json({ configured: true, dresses: next });
}
