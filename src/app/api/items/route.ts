import { db } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await db.getItems();
    return Response.json(items);
  } catch {
    return Response.json({ error: 'Fehler beim Laden der Items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await db.createItem(body);
    return Response.json(item, { status: 201 });
  } catch {
    return Response.json({ error: 'Fehler beim Erstellen des Items' }, { status: 500 });
  }
}
