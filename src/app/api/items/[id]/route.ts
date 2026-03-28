import { db } from '@/lib/data';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/items/[id]'>) {
  try {
    const { id } = await ctx.params;
    const item = await db.getItem(id);
    if (!item) return Response.json({ error: 'Item nicht gefunden' }, { status: 404 });
    return Response.json(item);
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/items/[id]'>) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const item = await db.updateItem(id, body);
    if (!item) return Response.json({ error: 'Item nicht gefunden' }, { status: 404 });
    return Response.json(item);
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/items/[id]'>) {
  try {
    const { id } = await ctx.params;
    const deleted = await db.deleteItem(id);
    if (!deleted) return Response.json({ error: 'Item nicht gefunden' }, { status: 404 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
