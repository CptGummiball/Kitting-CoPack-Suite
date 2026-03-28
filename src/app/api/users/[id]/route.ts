import { db } from '@/lib/data';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
  try {
    const { id } = await ctx.params;
    const user = await db.getUser(id);
    if (!user) return Response.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    return Response.json(user);
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const user = await db.updateUser(id, body);
    if (!user) return Response.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    return Response.json(user);
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
  try {
    const { id } = await ctx.params;
    const deleted = await db.deleteUser(id);
    if (!deleted) return Response.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
